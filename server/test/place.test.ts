import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Request, Response } from 'express';
import * as placeController from '../controllers/place.js';
import * as placeModel from '../models/place.js';
import { Place } from '../types/trip.js';

describe('getTripPlaces', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { params: { tripId: '1' } };
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnValue({ json: vi.fn() }),
    };
  });

  const selectPlacesByTripId = vi.spyOn(placeModel, 'selectPlacesByTripId');

  it('should return places', async () => {
    await placeController.getTripPlaces(req as Request, res as Response);
    expect(selectPlacesByTripId).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalled();
  });
});

describe('selectPlacesByTripId', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { params: { tripId: '1' } };
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnValue({ json: vi.fn() }),
    };
  });

  const selectPlacesByTripId = vi.spyOn(placeModel, 'selectPlacesByTripId');

  it('should return places', async () => {
    await placeController.getTripPlaces(req as Request, res as Response);
    expect(selectPlacesByTripId).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalled();
  });

  it('should send an error JSON when tripId is not a number', async () => {
    req.params = { tripId: 'invalid' };

    await placeController.getTripPlaces(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status && res.status(400).json).toHaveBeenCalledWith({ error: 'Invalid trip id' });
  });

  it('should send an error JSON when tripId is missing', async () => {
    req.params = {};

    await placeController.getTripPlaces(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status && res.status(400).json).toHaveBeenCalledWith({ error: 'Invalid trip id' });
  });
});

describe('putPlace', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: { placeId: '69' },
      body: {
        day_number: 1,
        tag: 'food',
        note: 'note',
        start_hour: '09:00',
        end_hour: '10:00',
        budget: 100,
      },
    };
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnValue({ json: vi.fn() }),
    };
  });

  const updatePlace = vi.spyOn(placeModel, 'updatePlace');

  it('should update place', async () => {
    await placeController.putPlace(req as Request, res as Response);
    expect(updatePlace).toHaveBeenCalledWith(69, 1, 'food', 'note', '09:00', '10:00', 100);
    expect(res.json).toHaveBeenCalled();
  });

  it('should send an error JSON when placeId is not a number', async () => {
    req.params = { placeId: 'invalid' };

    await placeController.putPlace(req as Request, res as Response);

    expect(res.status && res.status(400).json).toHaveBeenCalledWith({ error: 'Invalid place id' });
  });

  it('should send an error JSON when placeId is missing', async () => {
    req.params = {};

    await placeController.putPlace(req as Request, res as Response);

    expect(res.status && res.status(400).json).toHaveBeenCalledWith({ error: 'Invalid place id' });
  });
});

describe('optimizeRoute', () => {
  const places = [
    {
      id: '1',
      name: 'place1',
      day_number: 1,
      tag: 'food',
      type: 'restaurant',
      note: 'note',
      marker_type: 'restaurant',
      start_hour: '09:00',
      end_hour: '10:00',
      longitude: 121.456,
      latitude: 24.456,
      address: 'address',
    },
    {
      id: '2',
      name: 'place2',
      day_number: 1,
      tag: 'food',
      type: 'restaurant',
      note: 'note',
      marker_type: 'restaurant',
      start_hour: '09:00',
      end_hour: '10:00',
      longitude: 121.789,
      latitude: 24.789,
      address: 'address',
    },
    {
      id: '3',
      name: 'place3',
      day_number: 1,
      tag: 'food',
      type: 'restaurant',
      note: 'note',
      marker_type: 'restaurant',
      start_hour: '09:00',
      end_hour: '10:00',
      longitude: 121.123,
      latitude: 24.123,
      address: 'address',
    },
  ];

  it('should return optimized route', () => {
    const result = placeController.optimizeRoute(places as Place[]);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(places.length);

    places.forEach((place) => {
      expect(result).toContain(place);
    });

    const firstPlace = result[0];
    const secondPlace = result[1];
    const thirdPlace = result[2];

    expect(firstPlace).toBe(places[0]);
    expect(secondPlace).toBe(places[2]);
    expect(thirdPlace).toBe(places[1]);
  });
});
