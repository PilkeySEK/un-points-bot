import { Document, MongoClient, WithId } from "mongodb";
import { mongo_uri } from "../../config.json";
import { Collection } from "discord.js";

class DatabaseError extends Error {}
/*
interface MonthlyPoints {
    month: number;
    year: number;
    points: number;
}

interface LastKnownMonthYear {
    month: number;
    year: number;
}
*/
interface User {
    user_id: string;
    points: number;
    wins: number;
    // points_this_month: number;
    // monthly_points: MonthlyPoints[];
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
    let user: User = {user_id: user_id, points: 0, wins: 0 /*, points_this_month: 0, monthly_points: []*/};
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

/**
 * Set the points that a user has collected in a certain month (for statistics)
 * @param user_id The id of the user as a string
 * @param year The year
 * @param month The month, 0 is january and 11 is december
 * @param points The points to set, will NOT update the total point amount
 *//*
export async function set_monthly_points(user_id: string, year: number, month: number, points: number) {
    await register_if_not_exist(user_id);
    const user = await user_collection.findOne({user_id: user_id});
    if(user == null) throw new DatabaseError("findOne() returned null");
    let new_monthly_points = user.monthly_points;
    for(let i = 0; i < user.monthly_points.length; i++) {
        const elem = user.monthly_points[i];
        if(!(elem.month == month && elem.year == year)) continue;
        new_monthly_points[i].points = points;
        user_collection.updateOne({user_id: user_id}, {$set: {monthly_points: new_monthly_points}});
        return;
    }
    new_monthly_points.push({year: year, month: month, points: points});
    user_collection.updateOne({user_id: user_id}, {$set: {monthly_points: new_monthly_points}});
    return;
}*/

/**
 * Gets the points gained by a user in a specific month
 * @param user_id The id of the user as a string
 * @param year The year
 * @param month The month, 0 is january and 11 is december
 * @returns The points gained in the specified month. Returns `undefined` if no data exists for the given month
 *//*
export async function get_monthly_points(user_id: string, year: number, month: number): Promise<number | undefined> {
    await register_if_not_exist(user_id);
    const user = await user_collection.findOne({user_id: user_id});
    if(user == null) throw new DatabaseError("findOne() returned null");
    user.monthly_points.forEach(monthlyPoints => {
        if(!(monthlyPoints.year == year && monthlyPoints.month == month)) return;
        return monthlyPoints.points;
    });
    return undefined;
}*/

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