import { Router } from "express";
const router = Router();

/**
 * GET /api/nav
 * The navbar tabs in plain text.
 */
router.get("/", (_req, res) => {
  res.json({
    items: [
      { path: "/", label: "Home" },
      { path: "/about", label: "About" },
      { path: "/events", label: "Events" },
      { path: "/get-involved", label: "Get Involved" },
      { path: "/resources", label: "Resources" },
      { path: "/profile", label: "Profile" }
    ]
  });
});

export default router;