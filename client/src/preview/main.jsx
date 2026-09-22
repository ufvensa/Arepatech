import { createRoot } from "react-dom/client";
import FinanceWorkspace from "../pages/admin/FinanceWorkspace";
import { createPreviewService } from "./finance-preview.mjs";
const root = document.getElementById("finance-preview-root");
createRoot(root).render(
  <FinanceWorkspace service={createPreviewService()} preview />,
);
