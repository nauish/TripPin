import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Request, Response } from 'express';
import * as tripController from '../controllers/trip.js';
import * as tripModel from '../models/trip.js';
import * as userModel from '../models/user.js';

describe('getPublicTrips', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnValue({ json: vi.fn() }),
    };
  });
  const selectLatestPublicTrips = vi.spyOn(tripModel, 'selectLatestPublicTrips');
  const selectMostHighlyRatedTrips = vi.spyOn(tripModel, 'selectMostHighlyRatedTrips');
  const selectMostClickedTrips = vi.spyOn(tripModel, 'selectMostClickedTrips');

  it('should return latest trips when sort is latest', async () => {
    req.query = { sort: 'latest', page: '1' };
    await tripController.getPublicTrips(req as Request, res as Response);
    expect(selectLatestPublicTrips).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalled();
  });

  it('should return top rated trips when sort is top-rated', async () => {
    req.query = { sort: 'top-rated', page: '1' };
    await tripController.getPublicTrips(req as Request, res as Response);
    expect(selectMostHighlyRatedTrips).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalled();
  });

  it('should return most clicked trips when sort is hottest', async () => {
    req.query = { sort: 'hottest', page: '1' };
    await tripController.getPublicTrips(req as Request, res as Response);
    expect(selectMostClickedTrips).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalled();
  });

  it('should send an error JSON when sort option is invalid', async () => {
    req.query = { sort: 'invalid', page: '1' };

    await tripController.getPublicTrips(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status && res.status(400).json).toHaveBeenCalledWith({
      error: 'Invalid sort option',
    });
  });

  it('should send latest trips when sort is missing', async () => {
    req.query = { page: '1' };

    await tripController.getPublicTrips(req as Request, res as Response);

    expect(tripModel.selectLatestPublicTrips).toHaveBeenCalledWith(1);
  });
});

describe('recordClicks', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: { tripId: '1' },
    };
    res = {
      json: vi.fn(),
    };
  });
  const updateTripClickCount = vi.spyOn(tripModel, 'updateTripClickCount');

  it('should update trip click count', async () => {
    await tripController.recordClicks(req as Request, res as Response);
    expect(updateTripClickCount).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalled();
  });
});

describe('deleteTrip', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: { tripId: '3' },
    };
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnValue({ json: vi.fn() }),
    };
  });
  const deleteFromTripsByTripId = vi.spyOn(tripModel, 'deleteFromTripsByTripId');

  it('should delete trip', async () => {
    deleteFromTripsByTripId.mockResolvedValueOnce(3);
    await tripController.deleteTrip(req as Request, res as Response);
    expect(deleteFromTripsByTripId).toHaveBeenCalledWith(3);
    expect(res.json).toHaveBeenCalled();
  });

  it('should send an error JSON when delete fails', async () => {
    deleteFromTripsByTripId.mockResolvedValueOnce(0);
    await tripController.deleteTrip(req as Request, res as Response);
    expect(res.status && res.status(500).json).toHaveBeenCalledWith({ error: '刪除行程失敗' });
  });
});

describe('getTripsAttendedByUser', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: { userId: '1' },
    };
    res = {
      json: vi.fn(),
    };
  });
  const selectTripsAttendedByUser = vi.spyOn(userModel, 'selectTripsAttendedByUser');

  it('should return trips attended by user', async () => {
    await tripController.getTripsAttendedByUser(req as Request, res as Response);
    expect(selectTripsAttendedByUser).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalled();
  });
});

describe('getTripById', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: { tripId: '1' },
    };
    res = {
      json: vi.fn(),
    };
  });
  const selectTripById = vi.spyOn(tripModel, 'selectTripById');

  it('should return trip by id', async () => {
    await tripController.getTrip(req as Request, res as Response);
    expect(selectTripById).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalled();
  });
});
