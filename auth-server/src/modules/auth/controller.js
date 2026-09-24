import jwt from 'jsonwebtoken'
import * as UserServices from '../../models/user/services.js';
import { JWT_TOKEN, NODE_ENV } from '../../constants.js';
import { verifyPassword, getHashString } from '../../utils/comparePassword.js';
import * as SessionServices from '../../models/session/services.js';
import { hashToken } from '../../utils/hashToken.js';

export async function register(req, res){
    try{
        const { username, email, password } = req.body;

        if(!username || !email || !password){
            return res.status(400).json({
                success: false,
                message: 'username, email, password are required'
            });
        }

        const isUserAlreadyExist = await UserServices.getUserByQuery({
            $or: [
                { username },
                { email }
            ]
        });

        if(isUserAlreadyExist){
            return res.status(409).json({
                message: 'Email or Username already exist.'
            });
        }
        const hashedPassword = await getHashString(password);

        const user = await UserServices.createUser({
            username,
            email,
            password: hashedPassword
        });

        const refreshToken = jwt.sign(
            {id: user._id},
            JWT_TOKEN, 
            {expiresIn: '7d'}
        );

        const refreshTokenHash = await hashToken(refreshToken);

        const session = await SessionServices.createSession({
            user: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        });

        const accessToken = jwt.sign(
            {
                id: user._id,
                sessionId: session._id
            },
            JWT_TOKEN, 
            {expiresIn: '15m'}
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(201).json({
            success: true,
            data: {
              user:{
                _id: user._id,
                username: user.username,
                email: user.email,
              },
              accessToken,
            },
            message: 'User has been created'
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

export async function login(req, res) {
    try{
        const { email, password } = req.body;
        if( !email || !password ) {
            return res.status(400).json({
                message: "Email or Password are required."
            });
        }

        const user = await UserServices.getUserByEmail({email});
        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }
        const isPasswordMatch = await verifyPassword(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }
        const refreshToken = jwt.sign(
            { id: user._id },
            JWT_TOKEN,
            { expiresIn: '7d' }
        );
        const refreshTokenHash = await hashToken(refreshToken);
        const session = await SessionServices.createSession({
            user: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        });
        const accessToken = jwt.sign(
            {
                id: user._id,
                sessionId: session._id
            },
            JWT_TOKEN,
            { expiresIn: '15m' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            data : {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                },
                accessToken: accessToken
            },
            message: "Login successfull"
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

export async function logout(req, res) {
    try{
        const refreshToken = req.cookies.refreshToken;

        if(!refreshToken){
            return res.status(400).json({
                success: false,
                message: "refreshToken not found",
            })
        }

        const refreshTokenHash = await hashToken(refreshToken);

        const session = await SessionServices.getSessionByQuery({
            refreshTokenHash,
            revoked: false,
        });

        if(!session){
            return res.status(400).json({
                success: false,
                message: "Invalide refreshToken"
            })
        }
        
        const sessionRevoked = await SessionServices.updateSessionByQuery(
            { _id: session._id },
            { $set: { revoked: true } }
        );

        if(!sessionRevoked){
            throw new Error('Unable to revoke session')
        }
        // session.revoked = true
        // await session.save()  // if we wanted go with session model directly

        res.clearCookie("refreshToken");

        res.status(200).json({
            success:true,
            message: "Log out successfully."
        })
    }catch(error){
          res.status(500).json({
            success: false,
            message: 'Failed to logout user'
        })
    }
}

export async function getMe(req, res) {
    try{
        const token = req.headers.authorization.split(' ')[1];
        if(!token){
            res.status(401).json({
                message: "User not authorized"
            });
        }
        const decoded = jwt.verify(token, JWT_TOKEN);
        const user = await UserServices.getById(decoded.id);

        return res.status(200).json({
            success: true,
            data : {
                user: {
                    username: user.username,
                    email: user.email
                }
            },
            message: "User fetch successfully"
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Failed to get user details'
        })
    }
}

export async function refreshToken(req, res) {
    try{
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(401).json({
                message: "refreshToken not found"
            });
        }
        const decoded = jwt.verify(refreshToken, JWT_TOKEN);

        const refreshTokenHash = await hashToken(refreshToken);
            
        const session = await SessionServices.getSessionByQuery({
            refreshTokenHash,
            revoked: false
        });

        if(!session){
            return res.status(400).json({
                success: false,
                message: "Invalide refreshToken"
            })
        }

        const accessToken = jwt.sign(
            {
                id: decoded.id,
                sessionId: session._id
            },
            JWT_TOKEN,
            {expiresIn: '15m'}
        );
        const newRefreshToken = jwt.sign(
            {id: decoded.id},
            JWT_TOKEN,
            {expiresIn: '7d'}
        )

        const newRefreshTokenHash = await getHashString(newRefreshToken);
        await SessionServices.updateSessionByQuery(
            { _id: session._id },
            { $set: { refreshTokenHash: newRefreshTokenHash } }
        );

        // optional 
        // session.refreshTokenHash = newRefreshTokenHash
        // await session.save()

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            data: {
                accessToken
            },
            message: "Access token refresh successfully"
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Failed to refresh token'
        })
    }
}