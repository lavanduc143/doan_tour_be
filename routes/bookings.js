import express from "express";
import {
  createBooking,
  getAllBooking,
  getBooking,
  updateBookingStatus,
} from "../Controllers/bookingController.js";
import { verifyAdmin, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/", verifyUser, createBooking);
router.get("/:id", verifyUser, getBooking);
router.get("/", verifyAdmin, getAllBooking);
router.put("/:id/status", updateBookingStatus);

export default router;
