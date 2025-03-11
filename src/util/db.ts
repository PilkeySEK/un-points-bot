import { Document, MongoClient, WithId } from "mongodb";
import { mongo_uri } from "../../config.json";
import { Collection } from "discord.js";

class DatabaseError extends Error {}

interface DailyPoints {
    day: number;
    month: number;
    year: number;
    points: number;
}
export interface MonthlyPoints {
    month: number;
    year: number;
    points: number;
}

interface User {
    user_id: string;
    points: number;
    wins: number;
    // points_this_month: number;
    // monthly_points: MonthlyPoints[];
    daily_points: DailyPoints[];
}

const mongo_client = new MongoClient(mongo_uri);

const database = mongo_client.db("un-points-bot");
const user_collection = database.collection<User>("users");

let quick_registered_lookup: string[]= [];

export async function init() {
    const users = user_collection.find({});
    for await (const user of users) {
        quick_registered_lookup.push(user.user_id);
    }
}

/**
 * Set a user's point amount
 * @param user_id The id of the user as a string
 * @param points The point amount to set
 * @throws `DatabaseError` if the update was not acknowledged (usually caused by the database not being connected)
 */
export async function set_user_points(user_id: string, points: number) {
    await register_if_not_exist(user_id);
    const res = await user_collection.updateOne({user_id: user_id}, {$set: {points: points}});
    if(!res.acknowledged) throw new DatabaseError("Not acknowledged");
}

/**
 * Get a user's point amount
 * @param user_id The id of the user as a string
 * @returns The user's point amount
 * @throws `DatabaseError` if the document was not found or the operation was not acknowledged
 */
export async function get_user_points(user_id: string): Promise<number> {
    await register_if_not_exist(user_id);
    const res = await user_collection.findOne({user_id: user_id});
    if(res == null) throw new DatabaseError("Database findOne() returned null");
    return res.points;
}

/**
 * Add a new user to the database
 * @param user A user object
 * @throws `DatabaseError` if the operation was not acknowledged (usually caused by the database not being connected)
 */
export async function register_user(user: User) {
    const res = await user_collection.insertOne(user);
    if(!res.acknowledged) throw new DatabaseError("Not acknowledged");
    quick_registered_lookup.push(user.user_id);
}

/**
 * Find a user by their id
 * @param user_id The id of the user as a string
 * @returns The user
 * @throws `DatabaseError` if the document was not found or the operation was not acknowledged
 */
export async function get_user(user_id: string): Promise<User> {
    await register_if_not_exist(user_id);
    const res = await user_collection.findOne({user_id: user_id});
    if(res == null) throw new DatabaseError("Database findOne() returned null");
    return res;
}

/**
 * Get the top 10 users by points
 * @returns The top 10, may return less than 10 elements
 */
export async function get_top_10_by_points(): Promise<User[]> {
    const res = user_collection.aggregate([{$sort: {points: -1}}, {$limit: 10}]);
    let top: User[] = [];
    for await (const doc of res) {
        top.push(doc as User);
    }
    return top;
}


async function register_if_not_exist(user_id: string) {
    if(quick_registered_lookup.indexOf(user_id) != -1) return;
    const mongo_res = await user_collection.countDocuments({user_id: user_id}, {limit: 1});
    if(mongo_res == 1) return;
    let user: User = {user_id: user_id, points: 0, wins: 0, daily_points: []};
    register_user(user);
}

/**
 * Adds 1 to the wins of the user
 * @param user_id The user id as a string
 * @throws `DatabaseError` if the document was not found or the operation was not acknowledged
 */
export async function add_win(user_id: string) {
    register_if_not_exist(user_id);
    const res = await user_collection.updateOne({user_id: user_id}, {$inc: {wins: 1}});
    if(!res.acknowledged) throw new DatabaseError("Not acknowledged");
}

/**
 * Removes 1 from the wins of the user
 * @param user_id The user id as a string
 * @throws `DatabaseError` if the document was not found or the operation was not acknowledged
 */
export async function remove_win(user_id: string) {
    register_if_not_exist(user_id);
    const res = await user_collection.updateOne({user_id: user_id}, {$inc: {wins: -1}});
    if(!res.acknowledged) throw new DatabaseError("Not acknowledged");
}

/**
 * Sets the wins of the user
 * @param user_id The user id as a string
 * @param wins The wins to set
 * @throws `DatabaseError` if the document was not found or the operation was not acknowledged
 */
export async function set_wins(user_id: string, wins: number) {
    register_if_not_exist(user_id);
    const res = await user_collection.updateOne({user_id: user_id}, {$set: {wins: wins}});
    if(!res.acknowledged) throw new DatabaseError("Not acknowledged");
}

/**
 * Gets the wins of the user
 * @param user_id The user id as a string
 * @throws `DatabaseError` if the document was not found, likely caused by the database not being connected
 */
export async function get_wins(user_id: string): Promise<number> {
    register_if_not_exist(user_id);
    const user = await user_collection.findOne({user_id: user_id});
    if(user == null) throw new DatabaseError("findOne() is null");
    return user.wins;
}

export async function addDailyPoints(user_id: string, points: number, day: number, month: number, year: number) {
    await register_if_not_exist(user_id);
    const user_data = await user_collection.findOne({user_id: user_id});
    if(user_data == null) throw new DatabaseError("user_data is null. Can't proceed");

    const update_points = async (list: DailyPoints[]) => {
        const res = await user_collection.updateOne({user_id: user_id}, {$set: {daily_points: daily_points}});
        if(!res.acknowledged) throw new DatabaseError("Not acknowledged");
    };

    let daily_points = user_data.daily_points;
    for(let i = 0; i < daily_points.length; i++) {
        let elem = daily_points[i];
        if(!(elem.day == day && elem.month == month && elem.year == year)) continue;
        elem.points += points;
        daily_points[i].points = elem.points;
        update_points(daily_points);
    }
    daily_points.push({day: day, month: month, year: year, points: points});
    update_points(daily_points);
}

export async function getAllDailyPoints(user_id: string): Promise<DailyPoints[]> {
    await register_if_not_exist(user_id);
    const user_data = await user_collection.findOne({user_id: user_id});
    if(user_data == null) throw new DatabaseError("user_data is null. Can't proceed");
    return user_data.daily_points;
}

export async function getMonthlyPoints(user_id: string): Promise<MonthlyPoints[]> {
    await register_if_not_exist(user_id);
    const user_data = await user_collection.findOne({user_id: user_id});
    if(user_data == null) throw new DatabaseError("user_data is null. Can't proceed");
    let monthly: MonthlyPoints[] = [];
    user_data.daily_points.forEach(element => {
        for(let i = 0; i < monthly.length; i++) {
            let elem = monthly[i];
            if(!(elem.month == element.month && elem.year == element.year)) continue;
            elem.points += element.points;
            monthly[i] = elem;
            return;
        }
        monthly.push({month: element.month, year: element.year, points: element.points});
    });
    return monthly;
}

export async function is_connected(): Promise<boolean> {
    let res: any;
    try {
        res = database.admin().ping();
    }
    catch (e) {
        return false;
    }
    return Object.prototype.hasOwnProperty.call(res, 'ok') && res.ok === 1;
}