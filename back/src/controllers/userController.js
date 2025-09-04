import bcrypt from "bcrypt";
import dayjs from "dayjs";
import transporter from "../configs/mailer.js";
import { UserService } from "../services/userService.js";
import { TokenService } from "../services/tokenService.js";

const userService = new UserService();
const tokenService = new TokenService();

export class UserController {
  async registerUser(req, res) {
    try {
      let { email, confirmEmail, password, confirmPassword } = req.body;

      email = email ? email.trim().toLowerCase() : null;
      confirmEmail = confirmEmail ? confirmEmail.trim().toLowerCase() : null;
      password = password ? password.trim() : null;
      confirmPassword = confirmPassword ? confirmPassword.trim() : null;

      if (!email || !confirmEmail || !password || !confirmPassword) {
        throw {
          status: 422,
          message: "All fields are required.",
        };
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        throw {
          status: 422,
          message: "Please enter a valid email address.",
        };
      }

      if (email !== confirmEmail) {
        throw {
          status: 422,
          message: "Email and confirmation email do not match.",
        };
      }

      if (password.length < 8) {
        throw {
          status: 422,
          message: "Password must be at least 8 characters.",
        };
      }

      if (password !== confirmPassword) {
        throw {
          status: 422,
          message: "Password and confirmation password do not match.",
        };
      }

      const checkEmail = await userService.findUserByEmail(email);
      if (checkEmail) {
        throw {
          status: 409,
          message: "Email is already registered.",
        };
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = {
        email,
        password: passwordHash,
      };

      const createdUser = await userService.registerUser(user);

      return res.status(201).json({
        message: "User registered successfully.",
      });
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }

  async loginUser(req, res) {
    try {
      let { email, password } = req.body;

      email = email ? email.trim().toLowerCase() : null;
      password = password ? password.trim() : null;

      if (!email || !password) {
        throw {
          status: 422,
          message: "All fields are required.",
        };
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        throw {
          status: 422,
          message: "Please enter a valid email address.",
        };
      }

      const user = await userService.findUserByEmail(email);
      if (!user) {
        throw {
          status: 401,
          message: "Invalid credentials.",
        };
      }

      const checkPassword = await bcrypt.compare(password, user.password);

      if (!checkPassword) {
        throw {
          status: 401,
          message: "Invalid credentials.",
        };
      }

      const token = await tokenService.generateTokens(user);

      return res.status(200).json({
        message: "Login successful.",
        user: {
          email: user.email,
        },
        token: token,
      });
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }

  async logoutUser(req, res) {
    try {
      const userId = req.userId;

      const result = await tokenService.revokeRefreshToken(userId);

      if (result > 0) {
        return res.status(200).json({
          message: "Logout successful.",
        });
      } else {
        throw {
          status: 404,
          message: "No active session found.",
        };
      }
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }

  async forgotPassword(req, res) {
    try {
      let { email } = req.body;
      email = email ? email.trim().toLowerCase() : null;

      if (!email) {
        throw {
          status: 422,
          message: "Email is required.",
        };
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        throw {
          status: 422,
          message: "Please enter a valid email address.",
        };
      }

      const user = await userService.findUserByEmail(email);
      if (!user) {
        return res.status(200).json({
          message:
            "If the email is registered, you will receive instructions to reset your password shortly.",
        });
      }

      const resetToken = await tokenService.generatePasswordResetToken(user.id);

      const mailOptions = {
        from: process.env.GOOGLE_USER,
        to: user.email,
        subject: "Password Reset",
        template: "forgotPassword",
        context: { resetToken },
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (error) {
        throw {
          status: 503,
          message: "Error sending email, try again later.",
        };
      }

      return res.status(200).json({
        message:
          "If the email is registered, you will receive instructions to reset your password shortly.",
      });
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      let { newPassword, newPasswordConfirm } = req.body;

      newPassword = newPassword ? newPassword.trim() : null;
      newPasswordConfirm = newPasswordConfirm
        ? newPasswordConfirm.trim()
        : null;

      if (!token || !newPassword || !newPasswordConfirm) {
        throw {
          status: 422,
          message: "All fields are required.",
        };
      }

      if (newPassword.length < 8 || newPasswordConfirm.length < 8) {
        throw {
          status: 422,
          message: "Password must be at least 8 characters.",
        };
      }

      if (newPassword !== newPasswordConfirm) {
        throw {
          status: 422,
          message: "Password and confirmation password do not match.",
        };
      }

      const { userId, expiresIn } =
        await tokenService.findPasswordResetTokenById(token);

      if (!userId || !expiresIn) {
        throw {
          status: 400,
          message: "Invalid or expired reset link.",
        };
      }

      const dateNow = dayjs().unix();

      if (dateNow > expiresIn) {
        throw {
          status: 400,
          message: "Invalid or expired reset link.",
        };
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      await userService.updatePassword(userId, passwordHash);
      await tokenService.revokePasswordResetToken(token);
      await tokenService.revokeRefreshToken(userId);

      return res.status(200).json({
        message: "Password updated successfully.",
      });
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }

  async updateEmail(req, res) {
    try {
      const userId = req.userId;
      let user = await userService.findUserById(userId);
      let { email, newEmail, password } = req.body;

      email = email ? email.trim().toLowerCase() : null;
      newEmail = newEmail ? newEmail.trim().toLowerCase() : null;
      password = password ? password.trim() : null;

      if (!user) {
        throw {
          status: 404,
          message: "User not found.",
        };
      }

      if (!email || !newEmail || !password) {
        throw {
          status: 422,
          message: "All fields are required.",
        };
      }

      if (email === newEmail) {
        throw {
          status: 422,
          message: "Your new email is the same as your current one.",
        };
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        throw {
          status: 422,
          message: "Invalid email format.",
        };
      }

      if (!emailRegex.test(newEmail)) {
        throw {
          status: 422,
          message: "Invalid new email format.",
        };
      }

      const checkEmail = await userService.findUserByEmail(email);
      const checkNewEmail = await userService.findUserByEmail(newEmail);

      if (!checkEmail || checkEmail.email !== user.email) {
        throw {
          status: 401,
          message: "Invalid credentials.",
        };
      }
      if (checkNewEmail) {
        throw {
          status: 409,
          message: "New email is already registered.",
        };
      }

      const checkPassword = await bcrypt.compare(password, user.password);

      if (!checkPassword) {
        throw {
          status: 401,
          message: "Invalid credentials.",
        };
      }

      user = await userService.updateEmail(userId, newEmail);

      return res.status(200).json({
        message: "Email updated successfully.",
        id: user.id,
        email: user.email,
      });
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }

  async updatePassword(req, res) {
    try {
      const userId = req.userId;

      let user = await userService.findUserById(userId);
      let { password, newPassword, newPasswordConfirm } = req.body;

      password = password ? password.trim() : null;
      newPassword = newPassword ? newPassword.trim() : null;
      newPasswordConfirm = newPasswordConfirm
        ? newPasswordConfirm.trim()
        : null;

      if (!user) {
        throw {
          status: 404,
          message: "User not found.",
        };
      }

      if (!password || !newPassword || !newPasswordConfirm) {
        throw {
          status: 422,
          message: "All fields are required.",
        };
      }

      if (password === newPassword) {
        throw {
          status: 422,
          message: "Your new password is the same as your current one.",
        };
      }

      if (newPassword.length < 8 || newPasswordConfirm.length < 8) {
        throw {
          status: 422,
          message: "Password must be at least 8 characters.",
        };
      }

      if (newPassword !== newPasswordConfirm) {
        throw {
          status: 422,
          message: "Password and confirmation password do not match.",
        };
      }

      const checkPassword = await bcrypt.compare(password, user.password);
      if (!checkPassword) {
        throw {
          status: 401,
          message: "Invalid credentials.",
        };
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      await userService.updatePassword(userId, passwordHash);
      await tokenService.revokeRefreshToken(userId);

      return res.status(200).json({
        message: "Password updated successfully.",
        id: user.id,
        email: user.email,
      });
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }
}
