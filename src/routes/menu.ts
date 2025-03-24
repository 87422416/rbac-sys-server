import { getMenuTree, getMenuTreeByUsername } from "../controllers/back-sys/menu";
import router from "./router";
import Joi from "joi";
import validateInput from "../middlewares/validateInput";
import validatePermission from "../middlewares/validatePermission";
import validateToken from "../middlewares/validateToken";

router.get("/menu",validateToken,validatePermission, getMenuTree);

router.get(
  "/menu/:username",
  validateToken,
  validateInput(
    Joi.object({
      username: Joi.string().required(),
    }),
    "params"
  ),
  validatePermission,
  getMenuTreeByUsername
);