import bcrypt from "bcrypt";
import { UserService } from "../services/userService.js";
import { TokenService } from "../services/tokenService.js";

const userService = new UserService();
const tokenService = new TokenService();

export class UserController {
  async registerUser(req, res) {
    try {
      if (!req.body) {
        return res.status(400).send("Request body is missing.");
      }

      let { email, password, confirmPassword } = req.body;

      if (!email || !password || !confirmPassword) {
        return res.status(422).send("Missing required fields.");
      }

      email = email.trim().toLowerCase();

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(422).send("Invalid email format.");
      }

      if (password !== confirmPassword) {
        return res.status(422).send("Passwords do not match.");
      }

      const userExists = await userService.findUserByEmail(email);
      if (userExists) {
        return res.status(409).send("Email is already registered.");
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = {
        email,
        password: passwordHash,
      };

      await userService.registerUser(user);

      return res.status(201).send("User registered successfully.");
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send("Internal server error. Please try again later.");
    }
  }

  async loginUser(req, res) {
    try {
      if (!req.body) {
        return res.status(400).send("Request body is missing.");
      }

      let { email, password } = req.body;

      if (!email || !password) {
        return res.status(422).send("Missing required fields.");
      }

      email = email.trim().toLowerCase();

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(422).send("Invalid email or password.");
      }

      const user = await userService.findUserByEmail(email);
      if (!user) {
        return res.status(401).send("Invalid email or password.");
      }

      const checkPassword = await bcrypt.compare(password, user.password);

      if (!checkPassword) {
        return res.status(401).send("Invalid email or password.");
      }

      const token = await tokenService.generateTokens(user);

      return res.status(200).json({
        token: token,
        msg: "Login successfull.",
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send("Internal server error. Please try again later.");
    }
  }

  async logoutUser(req, res) {
    try {
      if (!req.body) {
        return res.status(400).send("Request body is missing.");
      }

      const { refreshTokenId } = req.body;

      const result = await tokenService.revokeRefreshToken(refreshTokenId);

      if (result > 0) {
        return res.status(200).send("Logout successfully.");
      } else {
        return res
          .status(400)
          .send("Refresh token invalid or already removed.");
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send("Internal server error. Please try again later.");
    }
  }

  async updateEmail(req, res) {
    try {
      const id = req.params.id;

      let user = await userService.findUserById(id);

      if (!user) {
        return res.status(401).send("User not found.");
      }

      let { email, newEmail, password } = req.body;

      if (!email || !newEmail || !password) {
        return res.status(422).send("Missing required fields.");
      }

      if (email === newEmail) {
        return res
          .status(422)
          .send("Your new email is the same as your current one.");
      }

      email = email.trim().toLowerCase();
      newEmail = newEmail.trim().toLowerCase();

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(422).send("Invalid email format.");
      }

      if (!emailRegex.test(newEmail)) {
        return res.status(422).send("Invalid new email format.");
      }

      const checkEmail = await userService.findUserByEmail(newEmail);

      if (checkEmail) {
        return res.status(401).send("New email is already in use.");
      }

      const checkPassword = await bcrypt.compare(password, user.password);

      if (!checkPassword) {
        return res.status(401).send("Invalid password.");
      }

      user = await userService.updateEmail(id, newEmail);

      return res.status(200).json({
        id: user.id,
        email: user.email,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send("Internal server error. Please try again later.");
    }
  }

  async updatePassword(req, res) {
    try {
      const id = req.params.id;

      let user = await userService.findUserById(id);

      if (!user) {
        return res.status(401).send("User not found.");
      }

      const { password, newPassword, newPasswordConfirm } = req.body;

      if (!password || !newPassword || !newPasswordConfirm) {
        return res.status(422).send("Missing required fields.");
      }

      if (password === newPassword) {
        return res.status(422).send("Passwords are the same.");
      }

      if (newPassword !== newPasswordConfirm) {
        return res
          .status(422)
          .send("New password and confirmation do not match.");
      }

      const checkPassword = await bcrypt.compare(password, user.password);
      if (!checkPassword) {
        return res.status(401).send("Invalid password.");
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      await userService.updatePassword(id, passwordHash);

      return res.status(200).send("Password updated successfully.");
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send("Internal server error. Please try again later.");
    }
  }
}
