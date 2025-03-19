import { cloudinary } from "../configs/cloudinaryConfig.js";
import Tour from "../models/Tour.js";

// Create new tour (vừa upload ảnh vừa lưu vào DB)
// export const createTour = async (req, res) => {
//   try {
//     // Kiểm tra nếu có file ảnh
//     if (!req.file) {
//       return res
//         .status(400)
//         .json({ success: false, message: "No image uploaded" });
//     }

//     // Lấy URL ảnh từ Cloudinary (Cloudinary tự động lưu ảnh)
//     const imageUrl = req.file.path;

//     // Tạo tour mới với dữ liệu từ request và URL ảnh
//     const newTour = new Tour({
//       ...req.body,
//       photo: imageUrl, // Lưu đường dẫn ảnh vào DB
//     });

//     const savedTour = await newTour.save();
//     console.log("Tour saved:", savedTour);

//     res.status(200).json({
//       success: true,
//       message: "Successfully created",
//       data: savedTour,
//     });
//   } catch (error) {
//     console.error("Error creating tour:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to create. Try again!" });
//   }
// };

//New create tour update
export const createTour = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });
    }

    const imageUrl = req.file.path;

    const newTour = new Tour({
      ...req.body,
      photo: imageUrl,
      currentBookings: 0, // Mặc định là 0
      availableSlots: req.body.maxGroupSize, // Số chỗ trống ban đầu bằng maxGroupSize
    });

    const savedTour = await newTour.save();
    console.log("Tour saved:", savedTour);

    res.status(200).json({
      success: true,
      message: "Successfully created",
      data: savedTour,
    });
  } catch (error) {
    console.error("Error creating tour:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create. Try again!" });
  }
};

//update tour
// export const updateTour = async (req, res) => {
//   const id = req.params.id;

//   try {
//     const tour = await Tour.findById(id);
//     if (!tour) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Tour not found" });
//     }

//     // Nếu có file ảnh mới được tải lên
//     let newImageUrl = tour.photo; // Giữ nguyên ảnh cũ nếu không có ảnh mới
//     if (req.file) {
//       // Lấy public_id từ URL ảnh cũ để xóa
//       const oldImagePublicId = tour.photo.split("/").pop().split(".")[0];

//       // Xóa ảnh cũ trên Cloudinary
//       await cloudinary.uploader.destroy(`tours/${oldImagePublicId}`);

//       // Cập nhật ảnh mới
//       newImageUrl = req.file.path;
//     }

//     // Cập nhật thông tin tour
//     const updatedTour = await Tour.findByIdAndUpdate(
//       id,
//       {
//         $set: { ...req.body, photo: newImageUrl }, // Lưu ảnh mới vào DB
//       },
//       { new: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Successfully updated",
//       data: updatedTour,
//     });
//   } catch (error) {
//     console.error("Error updating tour:", error);
//     res.status(500).json({ success: false, message: "Failed to update" });
//   }
// };

//new update tour
export const updateTour = async (req, res) => {
  const id = req.params.id;

  try {
    const tour = await Tour.findById(id);
    if (!tour) {
      return res
        .status(404)
        .json({ success: false, message: "Tour not found" });
    }

    let newImageUrl = tour.photo;
    if (req.file) {
      const oldImagePublicId = tour.photo.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`tours/${oldImagePublicId}`);
      newImageUrl = req.file.path;
    }

    // Cập nhật availableSlots nếu maxGroupSize thay đổi
    if (req.body.maxGroupSize) {
      tour.availableSlots = req.body.maxGroupSize - tour.currentBookings;
    }

    const updatedTour = await Tour.findByIdAndUpdate(
      id,
      {
        $set: {
          ...req.body,
          photo: newImageUrl,
          availableSlots: tour.availableSlots,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Successfully updated",
      data: updatedTour,
    });
  } catch (error) {
    console.error("Error updating tour:", error);
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};

//Delete Tour
export const deleteTour = async (req, res) => {
  const id = req.params.id;

  try {
    const tour = await Tour.findById(id);
    if (!tour) {
      return res
        .status(404)
        .json({ success: false, message: "Tour not found" });
    }

    // Lấy public_id từ URL ảnh để xóa trên Cloudinary
    if (tour.photo) {
      const oldImagePublicId = tour.photo.split("/").pop().split(".")[0];

      // Xóa ảnh trên Cloudinary
      await cloudinary.uploader.destroy(`tours/${oldImagePublicId}`);
    }

    // Xóa tour khỏi DB
    await Tour.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Successfully deleted" });
  } catch (error) {
    console.error("Error deleting tour:", error);
    res.status(500).json({ success: false, message: "Failed to delete" });
  }
};

//Getsingle Tour
// export const getSingleTour = async (req, res) => {
//   const id = req.params.id;

//   try {
//     const tour = await Tour.findById(id).populate("reviews");

//     res
//       .status(200)
//       .json({ success: true, message: "Successfully", data: tour });
//   } catch (error) {
//     res.status(404).json({ success: false, message: "Not Found" });
//   }
// };

export const getSingleTour = async (req, res) => {
  const id = req.params.id;

  try {
    const tour = await Tour.findById(id).populate("reviews");

    if (!tour) {
      return res
        .status(404)
        .json({ success: false, message: "Tour not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Successfully", data: tour });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//Get All Tour
// export const getAllTour = async (req, res) => {
//   //For pagination
//   const page = parseInt(req.query.page);

//   //console.log(page)

//   try {
//     const tours = await Tour.find({})
//       .populate("reviews")
//       .skip(page * 8)
//       .limit(8);

//     res.status(200).json({
//       success: true,
//       count: tours.length,
//       message: "Successfully",
//       data: tours,
//     });
//   } catch (error) {
//     res.status(404).json({ success: false, message: "Not Found" });
//   }
// };

export const getAllTour = async (req, res) => {
  const page = parseInt(req.query.page) || 0; // Mặc định là trang 0 nếu không có query
  const limit = 8; // Số lượng tour mỗi trang

  try {
    const tours = await Tour.find({})
      .populate("reviews")
      .skip(page * limit)
      .limit(limit);

    const totalTours = await Tour.countDocuments(); // Tổng số lượng tour

    res.status(200).json({
      success: true,
      count: tours.length,
      total: totalTours,
      message: "Successfully",
      data: tours,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get tour by search
// export const getTourBySearch = async (req, res) => {
//   // hear 'i' means case sensitive
//   const city = new RegExp(req.query.city, "i");
//   const distance = parseInt(req.query.distance);
//   const maxGroupSize = parseInt(req.query.maxGroupSize);

//   try {
//     // gte means greater than equal
//     const tours = await Tour.find({
//       city,
//       distance: { $gte: distance },
//       maxGroupSize: { $gte: maxGroupSize },
//     }).populate("reviews");

//     res
//       .status(200)
//       .json({ success: true, message: "Successfully", data: tours });
//   } catch (error) {
//     res.status(404).json({ success: false, message: "Not Found" });
//   }
// };

export const getTourBySearch = async (req, res) => {
  const city = new RegExp(req.query.city, "i"); // Tìm kiếm không phân biệt hoa thường
  const distance = parseInt(req.query.distance) || 0; // Mặc định là 0 nếu không có query
  const maxGroupSize = parseInt(req.query.maxGroupSize) || 0; // Mặc định là 0 nếu không có query

  try {
    const tours = await Tour.find({
      city,
      distance: { $gte: distance }, // Khoảng cách lớn hơn hoặc bằng
      maxGroupSize: { $gte: maxGroupSize }, // Kích thước nhóm lớn hơn hoặc bằng
    }).populate("reviews");

    res
      .status(200)
      .json({ success: true, message: "Successfully", data: tours });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//Get featured Tour
// export const getFeaturedTour = async (req, res) => {
//   //console.log(page)

//   try {
//     const tours = await Tour.find({ featured: true })
//       .populate("reviews")
//       .limit(8);

//     res
//       .status(200)
//       .json({ success: true, message: "Successfully", data: tours });
//   } catch (error) {
//     res.status(404).json({ success: false, message: "Not Found" });
//   }
// };

export const getFeaturedTour = async (req, res) => {
  try {
    const tours = await Tour.find({ featured: true })
      .populate("reviews")
      .limit(8);

    res
      .status(200)
      .json({ success: true, message: "Successfully", data: tours });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//Get tour count
export const getTourCount = async (req, res) => {
  try {
    const tourCount = await Tour.estimatedDocumentCount();

    res.status(200).json({ success: true, data: tourCount });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch" });
  }
};

export const getToursByPriceRange = async (req, res) => {
  const minPrice = parseInt(req.query.minPrice) || 0;
  const maxPrice = parseInt(req.query.maxPrice) || Infinity;

  try {
    const tours = await Tour.find({
      price: { $gte: minPrice, $lte: maxPrice },
    }).populate("reviews");

    res
      .status(200)
      .json({ success: true, message: "Successfully", data: tours });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getToursByAvailableSlots = async (req, res) => {
  try {
    const tours = await Tour.find({ availableSlots: { $gt: 0 } }).populate(
      "reviews"
    );

    res
      .status(200)
      .json({ success: true, message: "Successfully", data: tours });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
