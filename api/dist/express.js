"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = express_1.default();
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const googleapis_1 = require("googleapis");
const client_1 = require("@prisma/client");
const _ = __importStar(require("lodash"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const moment_1 = __importDefault(require("moment"));
const prisma = new client_1.PrismaClient();
// const PORT = process.env.PORT || 3000;
const scopes = [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
    'https://www.googleapis.com/auth/classroom.rosters.readonly'
];
let GoogleRedirectURL, authClient;
const ROOT_DIR = path_1.default.resolve(__dirname, "../../client/dist");
(() => __awaiter(void 0, void 0, void 0, function* () {
    let { GURL, auth } = yield init();
    GoogleRedirectURL = GURL;
    authClient = auth;
}))();
//Classroom API Code
function init() {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        fs_1.default.readFile('api/credentials.json', (err, content) => __awaiter(this, void 0, void 0, function* () {
            if (err)
                return console.error('Error loading client secret file:', err);
            let credentials = JSON.parse(content.toString());
            const { client_secret, client_id, redirect_uris } = credentials.web;
            const oauth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[1]);
            const url = oauth2Client.generateAuthUrl({
                // 'online' (default) or 'offline' (gets refresh_token)
                access_type: 'offline',
                prompt: 'consent',
                // If you only need one scope you can pass it as a string
                scope: scopes
            });
            res({ GURL: url, auth: oauth2Client });
        }));
    }));
}
function retrieveToken(code) {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        let authInstance = authClient;
        const { tokens } = yield authInstance.getToken(code);
        authInstance.setCredentials(tokens);
        let userId = yield getUserId(authInstance);
        res({ userId, refreshToken: tokens.refresh_token, auth: authInstance });
    }));
}
function getUserId(auth) {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        const classroom = googleapis_1.google.classroom({ version: "v1", auth });
        let { data: { id: userId } } = yield classroom.userProfiles.get({ userId: 'me' }); //retrieve classroom userId
        res(userId);
    }));
}
function listCoursework(auth) {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        const classroom = googleapis_1.google.classroom({ version: "v1", auth });
        let { data: { courses } } = yield classroom.courses.list({ courseStates: ["ACTIVE"] });
        let promiseArray = [];
        if (!courses) {
            res([]);
            return;
        }
        for (let course of courses) {
            promiseArray.push(classroom.courses.courseWork.studentSubmissions.list({ courseId: course.id, courseWorkId: "-", states: ["CREATED"], late: 'NOT_LATE_ONLY' }));
        }
        let dataArr1 = yield Promise.all(promiseArray);
        let submissionsArr = [];
        dataArr1.map(val => val.data.studentSubmissions).forEach(val => {
            if (val !== undefined) {
                val.forEach(val => {
                    submissionsArr.push(val);
                });
            }
        });
        promiseArray = [];
        for (let submission of submissionsArr) {
            promiseArray.push(classroom.courses.courseWork.get({ courseId: submission.courseId, id: submission.courseWorkId }));
        }
        let dataArr2 = yield Promise.all(promiseArray);
        let courseWorkArr = [];
        courseWorkArr = dataArr2.map(val => val.data);
        res(courseWorkArr);
    }));
}
function listGCCourses(auth) {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        const classroom = googleapis_1.google.classroom({ version: "v1", auth });
        let { data: { courses } } = yield classroom.courses.list({ courseStates: ["ACTIVE"] });
        if (!courses) {
            res([]);
            return;
        }
        res(courses);
    }));
}
function convertGCTaskArr(couseWorkArr) {
    return couseWorkArr.map(courseWork => {
        let returnedTask;
        let dueDate = new Date();
        let dateS;
        let dateCreated;
        let removeDateBool = false;
        let hasDueDate = true;
        let hasDueTime = true;
        let cwDate = courseWork.dueDate;
        let cwTime = courseWork.dueTime;
        if (cwDate === undefined) {
            removeDateBool = true;
            hasDueDate = false;
            hasDueTime = false;
        }
        else if (cwTime === undefined) {
            dueDate = new Date(cwDate.year, cwDate.month, cwDate.day);
            hasDueTime = false;
        }
        else {
            if (cwTime.hours == undefined) {
                cwTime.hours = 0;
            }
            if (cwTime.minutes == undefined) {
                cwTime.minutes = 0;
            }
            if (cwTime.seconds == undefined) {
                cwTime.seconds = 0;
            }
            dueDate = moment_1.default.utc().year(cwDate.year).month(cwDate.month - 1).date(cwDate.day).hour(cwTime.hours).minute(cwTime.minutes).second(cwTime.seconds).toDate();
        }
        dateS = dueDate.toISOString();
        if (courseWork.creationTime) {
            dateCreated = courseWork.creationTime;
        }
        else {
            dateCreated = (new Date()).toISOString(); //if undefined dateCreated will be 'now'
        }
        returnedTask = {
            id: undefined,
            title: '',
            description: "",
            dueDate: dateS,
            dateCreated,
            hasDueTime,
            hasDueDate,
            isCompleted: false,
            isDeleted: false,
            isClassroomCourseWork: true,
            courseWorkLink: courseWork.alternateLink,
            courseWorkId: courseWork.id,
            courseWorkTitle: courseWork.title,
            courseWorkDescription: courseWork.description,
            courseId: courseWork.courseId
        };
        if (removeDateBool) {
            delete returnedTask.dueDate;
        }
        return returnedTask;
    });
}
//utility methods (for prisma)
function convertToAgendaTasks(tasks) {
    return tasks.map(task => { return _.omit(_.omitBy(task, _.isNull), ['userId']); });
}
function convertToAgendaLabels(labels) {
    return labels.map(label => { return _.omit(_.omitBy(label, _.isNull), ['userId']); });
}
//prisma methods
function createUser(userId) {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        yield prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId }
        });
        res();
    }));
}
function checkUserExists(userId) {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        let user = yield prisma.user.findUnique({
            where: { id: userId }
        });
        if (user === null) {
            res(false);
            return;
        }
        res(true);
    }));
}
function storeGCTasks(userId, classroomTasks) {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        let user = yield prisma.user.findUnique({
            where: { id: userId },
            select: {
                tasks: true
            }
        });
        if (user === null) {
            rej("User Not Found in Database!");
            return;
        }
        let agendaDBTasks = user.tasks;
        let IdArr = agendaDBTasks.map((task) => task.courseWorkId);
        let courseWorkOldArr = classroomTasks.filter((task) => IdArr.includes(task.courseWorkId));
        let courseWorkNewArr = classroomTasks.filter((task) => !IdArr.includes(task.courseWorkId));
        let transactionsUpdateArr = [];
        for (let courseWork of courseWorkOldArr) { //old task
            transactionsUpdateArr.push(prisma.task.updateMany({
                where: { AND: [{
                            userId
                        }, {
                            courseWorkId: courseWork.courseWorkId
                        }] },
                data: {
                    hasDueDate: courseWork.hasDueDate,
                    hasDueTime: courseWork.hasDueTime,
                    courseWorkLink: courseWork.courseWorkLink,
                    courseWorkTitle: courseWork.courseWorkTitle,
                    courseWorkDescription: courseWork.courseWorkDescription,
                    dueDate: courseWork.dueDate
                }
            }));
        }
        let transactionsCreateArr = [];
        for (let courseWork of courseWorkNewArr) { //new task
            courseWork.title = courseWork.courseWorkTitle ? courseWork.courseWorkTitle : '';
            transactionsCreateArr.push(prisma.task.create({ data: Object.assign(Object.assign({}, courseWork), { userId }) }));
        }
        let transactionGetUser = prisma.user.findUnique({
            where: { id: userId },
            include: { tasks: true }
        });
        let finalTransactionsArr = transactionsUpdateArr.concat(transactionsCreateArr);
        finalTransactionsArr.push(transactionGetUser);
        let result = yield prisma.$transaction(finalTransactionsArr);
        let resultTasks = result[result.length - 1].tasks;
        res(convertToAgendaTasks(resultTasks));
    }));
}
//task API methods
function retrieveAgendaTasks(userId) {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        let user = yield prisma.user.findUnique({
            where: { id: userId },
            include: {
                tasks: true
            }
        }).catch((err) => { rej(err); });
        if (user === null) {
            rej("User Not Found in Database");
            return;
        }
        if (user) {
            res(convertToAgendaTasks(user.tasks));
        }
    }));
}
function createAgendaTasks(userId, tasks) {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        let transactionsCreateArr = [];
        for (let task of tasks) {
            if (task.id !== undefined) {
                throw new Error("Task IDs must be undefined");
            }
            transactionsCreateArr.push(prisma.task.create({
                data: Object.assign(Object.assign({}, task), { userId })
            }));
        }
        let newTasks = yield prisma.$transaction(transactionsCreateArr).catch((err) => { rej(err); });
        if (newTasks) {
            res(convertToAgendaTasks(newTasks));
        }
    }));
}
function updateAgendaTasks(tasks) {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        let transactionsUpdateArr = [];
        for (let task of tasks) {
            if (task.id === undefined) {
                throw new Error("Task IDs must be defined");
            }
            transactionsUpdateArr.push(prisma.task.update({
                where: { id: task.id },
                data: task
            }));
        }
        yield prisma.$transaction(transactionsUpdateArr).catch((err) => { rej(err); });
        res();
    }));
}
function deleteAgendaTasks(tasks) {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        let transactionsDeleteArr = [];
        for (let task of tasks) {
            if (task.id === undefined) {
                throw new Error("Task IDs must be defined");
            }
            transactionsDeleteArr.push(prisma.task.delete({
                where: { id: task.id }
            }));
        }
        yield prisma.$transaction(transactionsDeleteArr).catch((err) => { rej(err); });
        res();
    }));
}
//label methods
function retrieveAgendaLabels(userId) {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        let user = yield prisma.user.findUnique({
            where: { id: userId },
            include: {
                labels: true
            }
        }).catch((err) => { rej(err); });
        if (user === null) {
            rej("User Not Found in Database");
            return;
        }
        if (user) {
            res(convertToAgendaLabels(user.labels));
        }
    }));
}
function createAgendaLabels(userId, labels) {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        let transactionsCreateArr = [];
        for (let label of labels) {
            if (label.id !== undefined) {
                throw new Error("Label IDs must be undefined");
            }
            transactionsCreateArr.push(prisma.label.create({
                data: Object.assign(Object.assign({}, label), { userId }) //just to be safe don't include label when creating agenda task
            }));
        }
        let newLabels = yield prisma.$transaction(transactionsCreateArr).catch((err) => { rej(err); });
        if (newLabels) {
            res(convertToAgendaLabels(newLabels));
        }
    }));
}
function updateAgendaLabels(labels) {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        let transactionsUpdateArr = [];
        for (let label of labels) {
            if (label.id === undefined) {
                throw new Error("Label IDs must be defined");
            }
            transactionsUpdateArr.push(prisma.label.update({
                where: { id: label.id },
                data: label
            }));
        }
        yield prisma.$transaction(transactionsUpdateArr).catch((err) => { rej(err); });
        res();
    }));
}
function deleteAgendaLabels(labels) {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        let transactionsDeleteArr = [];
        for (let label of labels) {
            if (label.id === undefined) {
                throw new Error("Label IDs must be defined");
            }
            transactionsDeleteArr.push(prisma.label.delete({
                where: { id: label.id }
            }));
        }
        yield prisma.$transaction(transactionsDeleteArr).catch((err) => { rej(err); });
        res();
    }));
}
//Express
app.use(express_1.default.static(ROOT_DIR));
app.use(cookie_parser_1.default('myAgendaApp'));
app.use(express_1.default.json());
app.get('/hello', (req, res) => {
    res.sendFile(ROOT_DIR + "/index.html");
});
app.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.signedCookies.refreshToken) {
        next();
        return;
    }
    let refreshToken = req.signedCookies.refreshToken;
    let authInstance = authClient;
    authInstance.setCredentials({ refresh_token: refreshToken });
    res.locals.auth = authInstance;
    res.locals.userId = req.signedCookies.userId;
    next();
}));
app.get('/google-url', (req, res) => {
    res.send(GoogleRedirectURL);
});
app.get('/oauth2callback', express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { userId, refreshToken } = yield retrieveToken(req.query.code);
    yield createUser(userId);
    res.cookie('userId', userId, { maxAge: 999 * 999 * 999 * 999, signed: true, httpOnly: true, secure: true });
    res.cookie('refreshToken', refreshToken, { maxAge: 999 * 999 * 999 * 999, signed: true, httpOnly: true, secure: true });
    res.redirect('/');
})));
app.post('/sign-out', express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('refreshToken');
    res.clearCookie('userId');
    res.status(200).send("Sucess!");
})));
app.get('/has-signed-in', express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.locals.auth || !res.locals.userId) { //no cookies
        res.send(false);
        return;
    }
    if (!(yield checkUserExists(res.locals.userId))) { //userid not in database
        res.clearCookie('refreshToken');
        res.clearCookie('userId');
        res.send(false);
        return;
    }
    res.send(true);
})));
app.get('/retrieve-tasks-q', express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.locals.auth) {
        throw new Error("User has not yet logged in!");
    }
    res.send(yield retrieveAgendaTasks(res.locals.userId));
})));
app.get('/retrieve-tasks-l', express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.locals.auth) {
        throw new Error("User has not yet logged in!");
    }
    let courseWorkArr = yield listCoursework(res.locals.auth);
    //then if doesn't exist store in database
    let readyTasks = yield storeGCTasks(res.locals.userId, convertGCTaskArr(courseWorkArr));
    res.send(readyTasks);
})));
app.post('/create-tasks', express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //request accepts an array
    if (!res.locals.userId) {
        throw new Error("User ID Not Found");
    }
    let tasks = req.body;
    if (!tasks || !Array.isArray(tasks)) {
        throw new Error("Tasks Either Don't Exist Or Is Not An Array!");
    }
    let tasksWithID = yield createAgendaTasks(res.locals.userId, tasks);
    res.send(tasksWithID);
})));
app.post('/update-tasks', express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.locals.userId) {
        throw new Error("User ID Not Found");
    }
    let tasks = req.body;
    if (!tasks || !Array.isArray(tasks)) {
        throw new Error("Tasks Either Don't Exist Or Is Not An Array!");
    }
    yield updateAgendaTasks(tasks);
    res.send("Sucess!");
})));
app.post('/delete-tasks', express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.locals.userId) {
        throw new Error("User ID Not Found");
    }
    let tasks = req.body;
    if (!tasks || !Array.isArray(tasks)) {
        throw new Error("Tasks Either Don't Exist Or Is Not An Array!");
    }
    yield deleteAgendaTasks(tasks);
    res.send("Sucess!");
})));
app.get('/list-courses', express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.locals.auth) {
        throw new Error("User has not yet logged in!");
    }
    res.send(yield listGCCourses(res.locals.auth));
})));
app.get('/retrieve-labels', express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.locals.auth) {
        throw new Error("User has not yet logged in!");
    }
    res.send(yield retrieveAgendaLabels(res.locals.userId));
})));
app.post('/create-labels', express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //request accepts an array
    if (!res.locals.userId) {
        throw new Error("User ID Not Found");
    }
    let labels = req.body;
    if (!labels || !Array.isArray(labels)) {
        throw new Error("Tasks Either Don't Exist Or Is Not An Array!");
    }
    let tasksWithID = yield createAgendaLabels(res.locals.userId, labels);
    res.send(tasksWithID);
})));
app.post('/update-labels', express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.locals.userId) {
        throw new Error("User ID Not Found");
    }
    let labels = req.body;
    if (!labels || !Array.isArray(labels)) {
        throw new Error("Tasks Either Don't Exist Or Is Not An Array!");
    }
    yield updateAgendaLabels(labels);
    res.send("Sucess!");
})));
app.post('/delete-labels', express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.locals.userId) {
        throw new Error("User ID Not Found");
    }
    let labels = req.body;
    if (!labels || !Array.isArray(labels)) {
        throw new Error("Labels Either Don't Exist Or Is Not An Array!");
    }
    yield deleteAgendaLabels(labels);
    res.send('Sucess');
})));
app.use((err, req, res, next) => {
    if (err) {
        if (!err.message) {
            console.error("ERROR: " + err);
            res.status(500).send(err.message);
            return;
        }
        console.error("ERROR: " + err.message);
        res.status(500).send(err.message);
    }
});
exports.default = app;
