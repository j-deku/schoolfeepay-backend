import DesignModel from "../models/DesignModel";
import fs from 'fs';
import { Request, Response, NextFunction } from "express";

//add design item
const addCourse = async (req: Request, res: Response): Promise<void> => {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    if (!req.file) {
        res.status(400).json({
            success: false,
            message: "Image file is required",
        });
        return; 
    }
    let image_filename = `${req.file.filename}`;

    const design = new DesignModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: image_filename,
        quantity: req.body.quantity || 0,
    })
    try {
        await design.save();
        res.json({ success: true, message: "Design Added" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error" })
    }
}

//all design list
const listCourse = async (req: Request, res: Response) => {
    try {
        const designs = await DesignModel.find({}).select("name description price image category quantity").lean();
        res.json({ success: true, data: designs })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const getCourseDetails = async(req:Request, res:Response) =>{
    try {
        const {id} = req.params;
        const design = await DesignModel.findById(id);
        if (!design) {
            res.status(404).json({ success: false, message: "Design not found" });
            return;
        }
        res.json({ success: true, data: design, message:"Design details found"});
    } catch (error: any) {
          if (error.name === "CastError") {
            res.status(400).json({ success: false, message: "Invalid design id" });
            return;
        }
        res.status(500).json({ success: false, message: "Error fetching design details" });
    }
}

const updateCourseQuantity = async (req: Request, res: Response): Promise<void> => {
    try {
        const design = await DesignModel.findById(req.body.id);
        if (!design) {
            res.status(404).json({ success: false, message: "Design not found" });
            return;
        }
        design.quantity = req.body.quantity;
        await design.save();
        res.json({ success: true, message: "Quantity updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error updating quantity" });
    }
}

//remove design item
const removeCourse = async (req: Request, res: Response): Promise<void> => {
    try {
        const design = await DesignModel.findById(req.body.id);

        if (!design) {
            res.status(404).json({
                success: false,
                message: "Design not found",
            });
            return;
        }
        fs.unlink(`uploads/${design.image}`, () => { })

        await DesignModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Design Removed" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

export { addCourse, listCourse, getCourseDetails, updateCourseQuantity, removeCourse }