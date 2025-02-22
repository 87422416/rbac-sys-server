import { getMenuTree, getMenuTreeByUserId } from "@/controllers/back-sys/menu";
import router from "./router";
import Joi from "joi";
import validateInput from "@/middlewares/validateInput";
import validatePermission from "@/middlewares/validatePermission";
import validateToken from "@/middlewares/validateToken";

router.get("/menu",validateToken,validatePermission, getMenuTree);

router.get(
  "/menu/:userId",
  validateToken,
  validateInput(
    Joi.object({
      userId: Joi.number().required(),
    }),
    "params"
  ),
  validatePermission,
  getMenuTreeByUserId
);