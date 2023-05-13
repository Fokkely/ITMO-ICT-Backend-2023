import LikesService from "../../services/users/LikesService";
import {Request, response, Response} from "express";
import axios from "axios";

class LikesController {
    private LikesService: LikesService

    constructor() {
        this.LikesService = new LikesService()
    }

    get = async (req: Request, res: Response) => {
        const {"user-id": userId} = req.headers
        if (userId) {
            return res.json(await this.LikesService.get(Number(userId)))
        }
        return res.status(412).json({error: "User ID not in headers"})
    }

    post = async (req: Request, res: Response) => {
        const {"user-id": userId} = req.headers
        const {gameId} = req.body
        if (userId) {
            return res.json(await this.LikesService.post(Number(gameId), Number(userId)))
        }
        return res.status(412).json({error: "User ID not in headers"})
    }

    delete = async (req: Request, res: Response) => {
        const {"user-id": userId} = req.headers
        const {id: likeId} = req.params
        if (userId) {
            return res.json(await this.LikesService.delete(Number(likeId)))
        }
        return res.status(412).json({error: "User ID not in headers"})
    }
}

export default LikesController;