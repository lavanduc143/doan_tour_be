import Booking from "./../models/Booking.js";
import Tour from "./../models/Tour.js";

// create new booking
// export const createBooking = async (req, res) => {
//   const newBooking = new Booking(req.body);

//   try {
//     const savedBooking = await newBooking.save();

//     res
//       .status(200)
//       .json({
//         success: true,
//         message: "Your tour is booked!",
//         data: savedBooking,
//       });
//   } catch (error) {
//     res.status(500).json({ success: true, message: "Internal server error!" });
//   }
// };

//create new booking update
export const createBooking = async (req, res) => {
  const newBooking = new Booking(req.body);
  //   console.log("Request body:", req.body);
  try {
    const savedBooking = await newBooking.save();

    // Cập nhật số lượng booking và chỗ còn trống của tour
    const tourId = req.body.tourId;
    const tour = await Tour.findById(tourId);

    if (tour) {
      tour.currentBookings += 1; // Tăng số lượng booking hiện tại
      tour.availableSlots -= 1; // Giảm số chỗ còn trống
      await tour.save();
    }

    res.status(200).json({
      success: true,
      message: "Your tour is booked!",
      data: savedBooking,
    });
  } catch (error) {
    //  console.error("🚨 Internal Server Error:", error);
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

export const cancelBooking = async (req, res) => {
  const bookingId = req.params.id;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const tourId = booking.tourId;
    const tour = await Tour.findById(tourId);

    if (tour) {
      tour.currentBookings -= 1; // Giảm số lượng booking hiện tại
      tour.availableSlots += 1; // Tăng số chỗ còn trống
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
