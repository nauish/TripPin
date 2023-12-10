import PDFDocument from 'pdfkit';
import { Request, Response } from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { selectCompleteTripInfo } from '../models/trip.js';
import { ValidationError } from '../middleware/errorHandler.js';
import { Place, PlacesByDay } from '../types/trip.js';

export async function generateTripPDF(req: Request, res: Response) {
  try {
    const { tripId } = req.params;

    const tripData = await selectCompleteTripInfo(+tripId);
    if (!tripData) {
      throw new ValidationError('Trip not found');
    }

    const doc = new PDFDocument();
    doc.font(`${dirname(fileURLToPath(import.meta.url))}/NotoSansCJKtc-Regular.otf`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="trip-${tripData.id}.pdf"`);

    doc.fontSize(20).text(`${tripData.name}`, { underline: true, align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`目的地: ${tripData.destination}`);
    doc.fontSize(14).text(`開始日期: ${tripData.start_date || '無'}`);
    doc.fontSize(14).text(`結束日期: ${tripData.end_date || '無'}`);
    doc.fontSize(14).text(`預算: ${tripData.budget || '無'}`);
    doc.fontSize(14).text(`類型: ${tripData.type || '無'}`);
    doc.fontSize(14).text(`備註: ${tripData.note || '無'}`);
    doc.moveDown();

    tripData.places.sort((a, b) => {
      if (a.day_number !== b.day_number) {
        return a.day_number - b.day_number;
      }
      return a.dnd_order - b.dnd_order;
    });

    // Group places by day
    const placesByDay = tripData.places.reduce((acc: PlacesByDay, place) => {
      const dayNumber = place.day_number;
      if (!acc[dayNumber]) {
        acc[dayNumber] = [];
      }
      acc[dayNumber].push(place);
      return acc;
    }, {});

    const { GOOGLE_MAP_API_KEY } = process.env;

    // Map places to markers, flatten the array, and join them with '&'
    const markers = Object.values(placesByDay)
      .map((placesOfDay: Place[], index) =>
        placesOfDay.map(
          (place: Place) =>
            `&markers=color:red|label:${index + 1}|${place.latitude},${place.longitude}`,
        ),
      )
      .flat()
      .join('');

    const baseStaticMapUrl =
      'https://maps.googleapis.com/maps/api/staticmap?size=600x600&maptype=roadmap';
    const googleStaticMapUrl = `${baseStaticMapUrl}${markers}&path=color:0x0000ff|weight:5&key=${GOOGLE_MAP_API_KEY}`;

    const image = await fetch(googleStaticMapUrl);
    if (image.ok) {
      const imageBlob = await image.blob();
      const buffer = await new Response(imageBlob).arrayBuffer();
      doc.image(buffer, { width: 450 });
      doc.addPage();
    }

    Object.entries(placesByDay).forEach(([dayNumber, places]) => {
      doc.moveDown();
      doc.fontSize(14).text(`Day ${dayNumber}`, { underline: true });

      places.forEach((place: Place) => {
        doc.moveDown();
        doc.fontSize(12).text(`${place.name}`, { underline: true });

        doc.fontSize(10).text(`時間: ${place.start_hour || '無'}-${place.end_hour || '無'}`);
        doc.fontSize(10).text(`類型: ${place.type || '無'}`);
        doc.fontSize(10).text(`標籤: ${place.tag || '無'}`);
        doc.fontSize(10).text(`筆記: ${place.note || '無'}`);
        doc.fontSize(10).text(`地址: ${place.address}`);
        const distanceMeter = place.distance_from_previous * 100000 || 0;
        const distanceText =
          distanceMeter > 1000
            ? `距離: ${(distanceMeter / 1000).toFixed(2)}公里`
            : `距離: ${distanceMeter.toFixed()}公尺`;
        doc.fontSize(10).text(distanceText);
      });
    });

    doc.pipe(res);
    doc.end();
    return null;
  } catch (error) {
    if (error instanceof ValidationError) return res.status(401).json({ error: error.message });
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: '無法產生PDF' });
  }
}
export default generateTripPDF;
