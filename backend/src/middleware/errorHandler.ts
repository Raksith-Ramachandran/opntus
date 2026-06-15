import { Request,Response,NextFunction } from "express";
import { logger } from "../utils/logger";
export interface AppError extends Error { statusCode?:number; isOperational?:boolean; }
export const createError = (message:string,statusCode:number):AppError => { const e=new Error(message) as AppError; e.statusCode=statusCode; e.isOperational=true; return e; };
export const errorHandler = (err:AppError,req:Request,res:Response,_next:NextFunction) => {
  const code = err.statusCode||500;
  const isProd = process.env.NODE_ENV==="production";
  if (code>=500) logger.error({ msg:err.message, stack:err.stack, url:req.originalUrl });
  res.status(code).json({ error:(code>=500&&isProd)?"An unexpected error occurred.":err.message, ...(!isProd&&code>=500&&{ stack:err.stack }) });
};
