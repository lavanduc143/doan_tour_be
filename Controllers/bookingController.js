import Booking from "./../models/Booking.js";
import Tour from "./../models/Tour.js";

//create new booking update
export const createBooking = async (req, res) => {
  const { tourId, guestSize } = req.body;

  const newBooking = new Booking({
    ...req.body,
    status: "Pending", // Gán trạng thái mặc định là Pending khi tạo booking mới
  });

  try {
    const savedBooking = await newBooking.save();

    // Cập nhật số lượng booking và chỗ còn trống của tour
    const tour = await Tour.findById(tourId);

    if (tour) {
      tour.currentBookings += 1; // Tăng số lượng booking hiện tại
      tour.availableSlots -= guestSize; // Giảm số chỗ còn trống dựa trên số lượng khách đặt
      await tour.save();
    }

    res.status(200).json({
      success: true,
      message: "Your tour is booked!",
      data: savedBooking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// get single booking
export const getBooking = async (req, res) => {
  const id = req.params.id;

  try {
    const book = await Booking.findById(id);

    res.status(200).json({ success: true, message: "Successful!", data: book });
  } catch (error) {
    res.status(404).json({ success: true, message: "Not Found!" });
  }
};

// get all booking
export const getAllBooking = async (req, res) => {
  try {
    const books = await Booking.find();

    res
      .status(200)
      .json({ success: true, message: "Successful!", data: books });
  } catch (error) {
    res.status(500).json({ success: true, message: "Internal server error!" });
  }
};

export const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Nhận trạng thái từ request (Approved / Rejected)

  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Nếu booking bị từ chối, cập nhật lại số chỗ trong tour
    if (status === "Rejected") {
      const { tourId, guestSize } = booking;
      const tour = await Tour.findById(tourId);

      if (tour) {
        tour.availableSlots += guestSize; // Cộng lại số chỗ đã bị giữ trước đó
        await tour.save();
      }
    }

    booking.status = status; // Cập nhật trạng thái
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking status updated",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

export const cancelBooking = async (req, res) => {
  const bookingId = req.params.id;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const { tourId, guestSize } = booking; // Lấy tourId và groupSize từ booking
    const tour = await Tour.findById(tourId);

    if (tour) {
      tour.currentBookings -= 1; // Giảm số lượng booking hiện tại
      tour.availableSlots += guestSize; // Cộng lại đúng số chỗ bị trừ
      await tour.save();
    }

    await Booking.findByIdAndDelete(bookingId);

    res
      .status(200)
      .json({ success: true, message: "Booking canceled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};
