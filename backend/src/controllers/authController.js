import { authenticateAdmin } from "../services/adminService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const login = asyncHandler(async (req, res) => {
  const { token, admin } = await authenticateAdmin(req.body);

  res.json({
    success: true,
    token,
    admin
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  });
});
