import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "./../utlis/jwt";
require("dotenv").config();
import ErrorHandler from "../utlis/ErrorHandler";
import { CatchAsyncError } from "../middleware/CatchAsyncError";
import { NextFunction, Request, Response } from "express";
import userModel, { IUser } from "../models/user.model";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utlis/sendMail";
import { redis } from "../utlis/redis";
import { getUserById } from "../services/user.service";

interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
}

export const registrationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exist", 400));
      }

      const user: IRegistrationBody = {
        name,
        email,
        password,
      };

      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;

      const data = { user: { name: user.name }, activationCode };

      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/Activation-mail.ejs"),
        data
      );

      try {
        await sendMail({
          email: user.email,
          subject: "Activate your account",
          template: "Activation-mail.ejs",
          data,
        });

        res.status(201).json({
          success: true,
          message: `Please check your email : ${user.email} to activate your account`,
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        console.log(error);
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: "5m",
    }
  );

  return { token, activationCode };
};

interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}
export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as IActivationRequest;

      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as { user: IUser; activationCode: string };

      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }

      const { name, email, password } = newUser.user;

      const existUser = await userModel.findOne({ email });

      if (existUser) {
        return next(new ErrorHandler("Email already Exist", 400));
      }

      const user = await userModel.create({
        name,
        email,
        password,
      });

      res.status(201).json({
        success: true,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// userlogin
interface ILoginRequest {
  email: string;
  password: string;
  role: string;
}

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, role } = req.body as ILoginRequest;

    if (!email || !password) {
      return next(new ErrorHandler("Please enter the email and password", 400));
    }

    const user = await userModel.findOne({ email }).select("+password");

    if (!user || role !== user.role) {
      return next(
        new ErrorHandler("Please enter valid email and password", 400)
      );
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return next(
        new ErrorHandler("Please enter valid email and password", 400)
      );
    }

    sendToken(user, 200, res);
  }
);

// user logout
export const logoutUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Clear cookies
      res.cookie("access_token", "", { maxAge: 1 });
      res.cookie("refresh_token", "", { maxAge: 1 });

      // Delete user session from Redis
      const userId = req.user?._id?.toString() || "";
      if (userId) {
        redis.del(userId);
      }

      // Send response
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update access token
export const updateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;
      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;

      const message = "Could not refresh token";
      if (!decoded) {
        return next(new ErrorHandler(message, 400));
      }

      const session = await redis.get(decoded.id as string);
      if (!session) {
        return next(new ErrorHandler(message, 400));
      }

      const user = JSON.parse(session);

      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as string,
        { expiresIn: "60m" }
      );

      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN as string,
        { expiresIn: "3d" }
      );

      req.user = user;

      res.cookie("access_token", accessToken, accessTokenOptions);
      res.cookie("refresh_token", refreshToken, refreshTokenOptions);

      res.status(200).json({
        status: "success",
        accessToken,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get user info

export const getUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id as any;
      getUserById(userId, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update user information

interface IUserUpdateInfo {
  name?: string;
  email?: string;
}

export const updateUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email } = req.body as IUserUpdateInfo;
      const userId = req.user?._id as any;
      const user = await userModel.findById(userId);

      if (email && user) {
        const isEmailExist = await userModel.findOne({ email });
        if (isEmailExist) {
          return next(new ErrorHandler("Email already exist", 400));
        }
        user.email = email;
      }
      if (name && user) {
        user.name = name;
      }
      await user?.save();

      await redis.set(userId, JSON.stringify(user));

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update password
interface IUpdatePassword {
  oldpassword: string;
  newpassword: string;
}

export const updatePassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldpassword, newpassword } = req.body as IUpdatePassword;

      // Validate input
      if (!oldpassword || !newpassword) {
        return next(
          new ErrorHandler("Please enter both the old and new passwords", 400)
        );
      }

      // Validate new password strength
      if (newpassword.length < 8) {
        return next(
          new ErrorHandler(
            "New password must be at least 8 characters long",
            400
          )
        );
      }

      const user = await userModel.findById(req.user?._id).select("+password");
      if (!user || !user.password) {
        return next(new ErrorHandler("Invalid user", 400));
      }

      // Check if old password matches
      const isPasswordMatched = await user.comparePassword(oldpassword);
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid old password", 400));
      }

      // Update password
      user.password = newpassword;
      await user.save();

      // Update user session in Redis
      try {
        await redis.set(req.user?._id as string, JSON.stringify(user));
      } catch (redisError) {
        return next(
          new ErrorHandler("Error updating user session in Redis", 500)
        );
      }

      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error: any) {
      return next(
        new ErrorHandler("An error occurred while updating the password", 500)
      );
    }
  }
);


// Send Password Reset Email
export const sendPasswordResetEmail = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as { email: string };

      // Validate input
      if (!email) {
        return next(new ErrorHandler("Please enter your email address.", 400));
      }

      const user = await userModel.findOne({ email });

      if (!user) {
        return next(
          new ErrorHandler("No account found with that email address.", 400)
        );
      }

      const secret = (user._id as string) + process.env.ACCESS_TOKEN;
      const token = jwt.sign({ userID: user._id }, secret, {
        expiresIn: "15m",
      });

      // Store reset token and expiration in database
      user.resetPasswordToken = token;
      user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
      await user.save();

      // Generate reset link
      const resetLink = `${process.env.FRONTEND_HOST}/account/reset-password-confirm/${user._id}/${token}`;
      console.log(resetLink); // Log the reset link for debugging

      const data = { user: { name: user.name }, resetLink };

      // Render the email template
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/Reset-password-mail.ejs"),
        data
      );

      try {
        await sendMail({
          email: user.email,
          subject: "Reset Your Password",
          template: "Reset-password-mail.ejs",
          data,
        });

        res.status(201).json({
          success: true,
          message: `A password reset link has been sent to ${user.email}. Please check your email.`,
        });
      } catch (error: any) {
        console.error("Error sending email:", error);
        return next(
          new ErrorHandler(
            "Failed to send reset email. Please try again later.",
            500
          )
        );
      }
    } catch (error: any) {
      console.error("Error in password reset process:", error);
      return next(
        new ErrorHandler(
          "An unexpected error occurred while processing your request. Please try again later.",
          500
        )
      );
    }
  }
);


// Reset Password
interface IResetPassword {
  password: string;
  confirmPassword: string;
}
export const resetPassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { password, confirmPassword } = req.body as IResetPassword;
      const { id, token } = req.params as { id: string; token: string };

      // Validate input
      if (!id || !token) {
        return next(
          new ErrorHandler("Invalid request. Missing user ID or token.", 400)
        );
      }

      // Validate new passwords
      if (!password || !confirmPassword) {
        return next(
          new ErrorHandler(
            "Please enter both the new password and confirmation password.",
            400
          )
        );
      }

      if (password !== confirmPassword) {
        return next(
          new ErrorHandler("The passwords do not match. Please try again.", 400)
        );
      }

      // Validate new password strength
      if (password.length < 8) {
        return next(
          new ErrorHandler(
            "The new password must be at least 8 characters long.",
            400
          )
        );
      }

      // Find user by ID and check reset token
      const user = await userModel.findById(id);

      if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
        return next(new ErrorHandler("Invalid or expired reset token.", 400));
      }

      // Check if the reset token is valid and not expired
      const secret = (user._id as string) + process.env.ACCESS_TOKEN;
      try {
        jwt.verify(token, secret);
      } catch (error) {
        return next(new ErrorHandler("Invalid or expired reset token.", 400));
      }

      if (user.resetPasswordExpires < new Date()) {
        return next(
          new ErrorHandler(
            "Reset token has expired. Please request a new password reset link.",
            400
          )
        );
      }

      if (user.resetPasswordToken !== token) {
        return next(
          new ErrorHandler(
            "Invalid reset token. Please request a new password reset link.",
            400
          )
        );
      }

      // Update the user's password
      user.password = password;
      user.resetPasswordToken = undefined; // Mark the token as used
      user.resetPasswordExpires = undefined; // Clear the expiration date
      await user.save();

      res.status(200).json({
        success: true,
        message: "Your password has been successfully reset.",
      });
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return next(
          new ErrorHandler(
            "The reset link has expired. Please request a new password reset link.",
            400
          )
        );
      } else if (error.name === "JsonWebTokenError") {
        return next(
          new ErrorHandler(
            "The reset link is invalid. Please request a new password reset link.",
            400
          )
        );
      } else {
        return next(
          new ErrorHandler(
            "An unexpected error occurred while updating your password. Please try again later.",
            500
          )
        );
      }
    }
  }
);
