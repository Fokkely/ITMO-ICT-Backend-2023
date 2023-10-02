import {UserService} from "../services/users/userService";
import User from "../models/users/User";
import {UserError} from "../helpers/errors/userError";
import {Request, Response} from "express";
import jwt from "jsonwebtoken"
import {jwtOptions} from "../middlewares/passport";
import RefreshTokenService from "../services/auth/RefreshToken";
import Post from "../models/posts/Post";
import {PostError} from "../helpers/errors/postError";

export class UserController {
    private userService: UserService

    constructor() {
        this.userService = new UserService()
    }

    post = async (request: Request, response: Response) => {
        const {body} = request
        try {
            const user: User | UserError = await this.userService.createUser(body)

            response.status(201).json(user)
        } catch (error: any) {
            response.status(404).json({error: error.message})
        }
    }

    get = async (request: Request, response: Response) => {
        try {
            const user: User | UserError = await this.userService.getById(+request.params.id)
            response.status(200).json(user)
        } catch (error: any) {
            response.status(404).json({error: error.message})
        }
    }
    getAll = async (request: Request, response: Response) => {
        const users: User[] = await this.userService.getAllUsers()
        response.status(200).json(users)
    }
    getByUsername = async (request: Request, response: Response) => {
        try {
            const user: User | UserError = await this.userService.getByUsername(request.params.username)
            response.status(200).json(user)
        } catch (error: any) {
            response.status(404).json({error: error.message})
        }
    }

    delete = async (request: Request, response: Response) => {
        try {
            await this.userService.deleteUser(+request.user?.id)
            response.status(200).json({message: "User deleted"})
        } catch (error: any) {
            response.status(404).json({error: error.message})
        }
    }

    auth = async (request: Request, response: Response) => {
        const {email, password} = request.body
        console.log("GET email and pass:" + email + " " + password)
        const {user, checkPassword} = await this.userService.checkPassword(email, password)

        if (checkPassword) {
            const payload = {id: user.id}
            console.log("payload is", payload)
            const accessToken = jwt.sign(payload, jwtOptions.secretOrKey)
            const refreshTokenService = new RefreshTokenService(user)
            const refreshToken = await refreshTokenService.generateRefreshToken()
            response.send({accessToken, refreshToken})
        }
    }

    refreshToken = async (request: Request, response: Response) => {
        const {body} = request
        const {refreshToken} = body
        const refreshTokenService = new RefreshTokenService()

        try {
            const {userId, isExpired} = await refreshTokenService
                .isRefreshTokenExpired(refreshToken)

            if (!isExpired && userId) {
                const user = await this.userService.getById(userId)
                const payload = {id: user.id}
                const accessToken = jwt.sign(payload, jwtOptions.secretOrKey)
                const refreshTokenService = new RefreshTokenService(user)
                const refreshToken = await refreshTokenService.generateRefreshToken()
                response.send({accessToken, refreshToken})
            } else {
                throw new Error('Invalid credentials')
            }
        } catch (e) {
            response.status(401).send({'error': 'Invalid credentials'})
        }
    }

    me = async (request: Request, response: Response) => {
        response.send(request.user);
    }

    getPosts = async (request: Request, response: Response) => {
        try {
            const posts: Post[] | PostError = await this.userService.getPosts(request.user?.id)
            response.status(200).json(posts)
        } catch (error: any) {
            response.status(404).json({error: error.message})
        }
    }
}