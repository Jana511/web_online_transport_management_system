import Route from '../models/Route.js';
import Van from '../models/Van.js';
import { createError } from '../utils/createError.js';

// Cleans the list of stops and sorts them by order (1, 2, 3...)
const cleanStops = (stops) => {
  if (stops === undefined) return [];
  if (!Array.isArray(stops)) {
    throw createError(400, 'Stops must be a list');
  }

  return stops
    .map((stop, index) => ({
      name: stop?.name,
      order: Number(stop?.order) || index + 1,
      pickupTime: stop?.pickupTime,
    }))
    .sort((a, b) => a.order - b.order);
};

// GET /api/routes  (admin only)
export const getRoutes = async (req, res) => {
  const routes = await Route.find().sort({ name: 1 });
  res.status(200).json({ success: true, routes });
};

// POST /api/routes  (admin only)
export const createRoute = async (req, res) => {
  const { name, school, stops } = req.body || {};

  if (!name || !school) {
    throw createError(400, 'Route name and school are required');
  }

  const route = await Route.create({
    name,
    school,
    stops: cleanStops(stops),
  });

  res.status(201).json({ success: true, message: 'Route created', route });
};

// PUT /api/routes/:id  (admin only)
export const updateRoute = async (req, res) => {
  const route = await Route.findById(req.params.id);
  if (!route) {
    throw createError(404, 'Route not found');
  }

  const { name, school, stops, isActive } = req.body || {};

  if (name !== undefined) route.name = name;
  if (school !== undefined) route.school = school;
  if (stops !== undefined) route.stops = cleanStops(stops);
  if (isActive !== undefined) route.isActive = Boolean(isActive);

  await route.save();

  res.status(200).json({ success: true, message: 'Route updated', route });
};

// DELETE /api/routes/:id  (admin only)
export const deleteRoute = async (req, res) => {
  const route = await Route.findById(req.params.id);
  if (!route) {
    throw createError(404, 'Route not found');
  }

  // Do not delete a route that a van is still using
  const vanUsingRoute = await Van.findOne({ route: route._id });
  if (vanUsingRoute) {
    throw createError(400, `Van ${vanUsingRoute.vanNumber} uses this route. Change the van's route first.`);
  }

  await route.deleteOne();

  res.status(200).json({ success: true, message: 'Route deleted' });
};