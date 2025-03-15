import passportJWT from "passport-jwt";
import passport from "passport";
import config from "../config";
import User from "../models/user";
import UserService from "../services/userService";

const { JWT_SECRET_KEY } = config;

const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 从请求头的 Authorization 字段中提取 token
  secretOrKey: JWT_SECRET_KEY, // JWT 密钥
};

// 配置 passport 策略
passport.use(
  new JwtStrategy(opts, async (jwt_payload: JWTPayload, done) => {
    const user = await User.findByPk(jwt_payload.userId);

    if (user && user.status !== "locked") {
      // 获取用户信息

      return done(null, { userId: user.id }); // 用户存在，返回用户信息
    } else {
      return done(null, false); // 用户不存在，返回 false
    }
  })
);

export default passport.authenticate("jwt", { session: false });
