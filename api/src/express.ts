import express from "express";
const app = express(); 
import fs from "fs";
import path from 'path';
import cookieParser from "cookie-parser";
import {google, Auth, classroom_v1} from "googleapis";
import {PrismaClient, Task, Prisma, User, Label} from '@prisma/client';
import * as _ from 'lodash';
import ash from 'express-async-handler';
import { NextFunction, Request, Response} from 'express';
import moment from 'moment';
const prisma = new PrismaClient();


// const PORT = process.env.PORT || 3000;
const scopes = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly'
  
];
let GoogleRedirectURL: string, authClient: Auth.OAuth2Client; 

interface AgendaTask {
  id?    : string, //set ID to undefined if task is new, prisma will set the id
  title : string,
  labelId?: string, //defined by client
  description: string, //user description, if empty set to ""
  dateCreated: string,
  dueDate?: string, //dueDate is set to an ISO String, input in new Date(string) to get date object
  hasDueTime: boolean, 
  hasDueDate : boolean,
  isCompleted: boolean,
  isDeleted: boolean,
  isClassroomCourseWork: boolean,
  courseWorkLink?: string, //if empty set to ""
  courseWorkId?: string,
  courseWorkTitle?: string,
  courseWorkDescription?: string,
  courseId? : string
}

interface AgendaTaskWLabel extends AgendaTask {
  label: string
}

interface AgendaLabel {
  id: string|undefined
  name: string
  isGCLabel: boolean
  courseId?: string
  courseName?: string
}

const ROOT_DIR = path.resolve(__dirname, "../../client/dist");


(async () => {
  let {GURL, auth}= await init();
  GoogleRedirectURL = GURL;
  authClient = auth;
})()  

//Classroom API Code
function init() {
return new Promise<{GURL: string, auth: Auth.OAuth2Client}>(async (res, rej) => {
  fs.readFile('api/credentials.json', async (err, content) => {
    if (err) return console.error('Error loading client secret file:', err);
    let credentials = JSON.parse(content.toString());
    const {client_secret, client_id, redirect_uris } = credentials.web;
    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[1]
  );
  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    prompt : 'consent',
    // If you only need one scope you can pass it as a string
    scope: scopes
  })
  res({GURL: url, auth: oauth2Client});
  });
})
}


function retrieveToken(code: string) {
  return new Promise<{userId: string, refreshToken: string, auth: Auth.OAuth2Client}>(async (res, rej) => {
    let authInstance = authClient;
    const {tokens} = await authInstance.getToken(code);
    authInstance.setCredentials(tokens);
    let userId = await getUserId(authInstance);
    res({userId, refreshToken: tokens.refresh_token!, auth: authInstance});
  })
}

function getUserId(auth: Auth.OAuth2Client) {
  return new Promise<string>(async (res, rej) => {
    const classroom = google.classroom({version:"v1", auth}); 
    let {data: {id : userId}} = await classroom.userProfiles.get({userId:'me'});//retrieve classroom userId
    res(userId!);
  });
}

function listCoursework(auth: Auth.OAuth2Client) {
  return new Promise<classroom_v1.Schema$CourseWork[]>(async (res, rej) => {
    const classroom = google.classroom({version:"v1", auth});
    let {data: {courses}} = await classroom.courses.list({courseStates: ["ACTIVE"]});
    let promiseArray = [];
    if (!courses) {
      res([]);
      return;
    }
      for (let course of courses) {
        promiseArray.push(classroom.courses.courseWork.studentSubmissions.list({courseId: course.id!, courseWorkId:"-", states: ["CREATED"], late: 'NOT_LATE_ONLY'}));
      } 
      let dataArr1 = await Promise.all(promiseArray);
      let submissionsArr:classroom_v1.Schema$StudentSubmission[] = [];
     dataArr1.map(val => val.data.studentSubmissions).forEach(val => { //convert promise data to normal array data
       if (val !== undefined) {
          val.forEach(val => {
            submissionsArr.push(val);
          })
       }
      });
      promiseArray = [];
      for (let submission of submissionsArr) {
        promiseArray.push(classroom.courses.courseWork.get({courseId: submission.courseId!,  id: submission.courseWorkId!}));
      } 
  
       let dataArr2 = await Promise.all(promiseArray);
      let courseWorkArr = [];
     courseWorkArr = dataArr2.map(val => val.data);  
     res(courseWorkArr);
  })
}

function listGCCourses(auth: Auth.OAuth2Client){
  return new Promise<classroom_v1.Schema$Course[]> (async (res, rej) => {
    const classroom = google.classroom({version:"v1", auth}); 
    let {data: {courses}} = await classroom.courses.list({courseStates: ["ACTIVE"]});
    if (!courses) {
      res([]);
      return;
    }
    res(courses)
  })
}

function convertGCTaskArr(couseWorkArr: classroom_v1.Schema$CourseWork[]){
return couseWorkArr.map(courseWork => {
  let returnedTask: AgendaTask;
  let dueDate = new Date();
  let dateS: string;
  let dateCreated: string;
  let removeDateBool = false;
  let hasDueDate = true;
  let hasDueTime = true;
  let cwDate = courseWork.dueDate;
  let cwTime = courseWork.dueTime;
  if (cwDate === undefined) {
    removeDateBool = true;
    hasDueDate= false;
    hasDueTime = false;
  } else if (cwTime === undefined){
    dueDate = new Date(cwDate.year!,cwDate.month!, cwDate.day!);
    hasDueTime = false;
  } else {
    if (cwTime.hours == undefined) {
      cwTime.hours = 0;
    }
    if (cwTime.minutes == undefined) {
      cwTime.minutes = 0;
    }
    if (cwTime.seconds == undefined) {
      cwTime.seconds = 0;
    }
    dueDate = moment.utc().year(cwDate.year!).month(cwDate.month!-1).date(cwDate.day!).hour(cwTime.hours).minute(cwTime.minutes).second(cwTime.seconds).toDate();
  }
  dateS = dueDate.toISOString();

  if (courseWork.creationTime) {
    dateCreated = courseWork.creationTime;
  } else {
    dateCreated = (new Date()).toISOString(); //if undefined dateCreated will be 'now'
  }
 
 returnedTask = {
    id : undefined, //retrieve id from database
    title : '',
    description: "", 
    dueDate : dateS,
    dateCreated,
    hasDueTime,
    hasDueDate,
    isCompleted: false,
    isDeleted: false,
    isClassroomCourseWork: true,
    courseWorkLink: courseWork.alternateLink!, 
    courseWorkId: courseWork.id!,
    courseWorkTitle: courseWork.title!,
    courseWorkDescription: courseWork.description!,
    courseId: courseWork.courseId!
  }
  if (removeDateBool) {
    delete returnedTask.dueDate;
  }
  return returnedTask;
})
}

//utility methods (for prisma)
function convertToAgendaTasks(tasks: Task[]) {
  return tasks.map(task => { return _.omit(_.omitBy(task, _.isNull), ['userId']) }) as unknown as AgendaTask[] 
}

function convertToAgendaLabels(labels: Label[]) {
  return labels.map(label => { return _.omit(_.omitBy(label, _.isNull), ['userId']) }) as unknown as AgendaLabel[] 
}

function convertPrismaConnects(task: AgendaTask) {
  let connects = _.pickBy(task, _.isPlainObject)
  for (const i in connects) {
    connects[i] = {connect: {id: connects[i].id}}
  }
  return _.assign(task, connects) as unknown as Prisma.TaskUpdateInput
}

function writeFile(dest: string, content:any) {
  return new Promise<void>(async (res, rej) => {
    fs.writeFile(dest, content.toString(), err => {
      if (err) {
        console.error(err)
        return
      }
    })
  })
}

//prisma methods
function createUser(userId: string) {
  return new Promise<void>(async (res, rej) => {
    await prisma.user.upsert({
      where: {id: userId},
      update: {},
      create: {id: userId}
    })
    res();
  })
}

function checkUserExists(userId: string) {
  return new Promise<boolean>(async (res, rej) => {
    let user = await prisma.user.findUnique({
      where: {id: userId}
    })
    if (user === null) {
      res(false);
      return;
    }
    res(true);
  })
}

function storeGCTasks(userId: string, classroomTasks: AgendaTask[]){//return tasks array with id
  return new Promise<AgendaTask[]>(async (res, rej) => {
    let user = await prisma.user.findUnique({
      where: {id: userId},
      select: {
        tasks: true
      }
    })
    if (user === null) {
      rej("User Not Found in Database!");
      return;
     }
    let agendaDBTasks = user.tasks; 
    let IdArr = agendaDBTasks.map((task) => task.courseWorkId);
     let courseWorkOldArr =  classroomTasks.filter((task) => IdArr.includes(task.courseWorkId!));
     let courseWorkNewArr =  classroomTasks.filter((task) => !IdArr.includes(task.courseWorkId!));
     let transactionsUpdateArr = [];
     for (let courseWork of courseWorkOldArr) { //old task
      transactionsUpdateArr.push(prisma.task.updateMany({
        where: {AND: [{
          userId
        }, {
            courseWorkId: courseWork.courseWorkId
        }]},
        data: {
          hasDueDate: courseWork.hasDueDate, //Due Date Also can't be changed!
          hasDueTime: courseWork.hasDueTime,
          courseWorkLink: courseWork.courseWorkLink,
          courseWorkTitle: courseWork.courseWorkTitle,
          courseWorkDescription: courseWork.courseWorkDescription,
          dueDate: courseWork.dueDate
        }
      })) 
     }
     let transactionsCreateArr = [];
     for (let courseWork of courseWorkNewArr) { //new task
      courseWork.title = courseWork.courseWorkTitle ? courseWork.courseWorkTitle : '';
      transactionsCreateArr.push(prisma.task.create({data : {...courseWork, userId }}));
     }
     let transactionGetUser = prisma.user.findUnique({
       where: {id: userId},
       include: {tasks: true}
     })
    let finalTransactionsArr: any[] = transactionsUpdateArr.concat(transactionsCreateArr as any);
    finalTransactionsArr.push(transactionGetUser);
    let result = await prisma.$transaction(finalTransactionsArr);
    let resultTasks = (result[result.length-1] as User & {tasks: Task[]}).tasks;
    res(convertToAgendaTasks(resultTasks));
})
}

//task API methods
function retrieveAgendaTasks(userId: string) {
  return new Promise<AgendaTask[]>(async (res, rej) => {
    let user = await prisma.user.findUnique({
      where: {id: userId},
      include: {
        tasks: true
      }
    }).catch((err) => {rej(err)});
    if (user === null) {
      rej("User Not Found in Database");
      return;
    }
    if (user) {
      res(convertToAgendaTasks(user.tasks));
    }
  })
}

(async () => {
  console.log("COOL");
  
  await writeFile('./test.txt', await retrieveAgendaTasks('104392824318813973075'));
})()


function createAgendaTasks(userId: string, tasks: AgendaTask[]) {
  return new Promise<AgendaTask[]>(async (res, rej) => {
    let transactionsCreateArr  = [];
    for (let task of tasks) {
      if (task.id !== undefined) {
        throw new Error("Task IDs must be undefined");
      }

     transactionsCreateArr.push(prisma.task.create({
       data : {...task, userId}
     })) 
    }
   let newTasks = await prisma.$transaction(transactionsCreateArr).catch((err) => {rej(err)});
   if (newTasks){
    res(convertToAgendaTasks(newTasks));
   }
  })
}


function updateAgendaTasks( tasks: AgendaTask[]){ //don't use this to update labels
  return new Promise<void>(async (res, rej) => {
    let transactionsUpdateArr = [];
    for (let task of tasks) {
      if (task.id === undefined) {
        throw new Error("Task IDs must be defined");
      }
      let prismaTask = convertPrismaConnects(task)
     transactionsUpdateArr.push(prisma.task.update({
       where: {id: task.id},
       data: prismaTask
     })) 
    }
   await prisma.$transaction(transactionsUpdateArr).catch((err) => {rej(err)});
   res();
  })
}

function deleteAgendaTasks(tasks: AgendaTask[]){
  return new Promise<void>(async (res, rej) => {
    let transactionsDeleteArr = [];
    for (let task of tasks) {
      if (task.id === undefined) {
        throw new Error("Task IDs must be defined");
      }
     transactionsDeleteArr.push(prisma.task.delete({
       where: {id: task.id}
     })) 
    } 
   await prisma.$transaction(transactionsDeleteArr).catch((err) => {rej(err)});
   res();
  })
}


//label methods
function retrieveAgendaLabels(userId: string) {
  return new Promise<AgendaLabel[]>(async (res, rej) => {
    let user = await prisma.user.findUnique({
      where: {id: userId},
      include: {
        labels: true
      }
    }).catch((err) => {rej(err)});
    if (user === null) {
      rej("User Not Found in Database");
      return;
    }
    if (user) {
      res(convertToAgendaLabels(user.labels));
    }
  })
}

function createAgendaLabels(userId: string, labels: AgendaLabel[]) {
  return new Promise<AgendaLabel[]>(async (res, rej) => {
    let transactionsCreateArr  = [];
    for (let label of labels) {
      if (label.id !== undefined) {
        throw new Error("Label IDs must be undefined");
      }
     transactionsCreateArr.push(prisma.label.create({
       data : {...label, userId} //just to be safe don't include label when creating agenda task
     })) 
    }
   let newLabels = await prisma.$transaction(transactionsCreateArr).catch((err) => {rej(err)});
   if (newLabels){
    res(convertToAgendaLabels(newLabels));
   }
  })
}


function updateAgendaLabels(labels: AgendaLabel[]){ 
  return new Promise<void>(async (res, rej) => {
    let transactionsUpdateArr = [];
    for (let label of labels) {
      if (label.id === undefined) {
        throw new Error("Label IDs must be defined");
      }
     transactionsUpdateArr.push(prisma.label.update({
       where: {id: label.id},
       data: label
     })) 
    }
   await prisma.$transaction(transactionsUpdateArr).catch((err) => {rej(err)});
   res();
  })
}

function deleteAgendaLabels(labels: AgendaLabel[]) {
  return new Promise<void>(async (res, rej) => {
    let transactionsDeleteArr = [];
    for (let label of labels) {
      if (label.id === undefined) {
        throw new Error("Label IDs must be defined");
      }
     transactionsDeleteArr.push(prisma.label.delete({
       where: {id: label.id}
     })) 
    } 
   await prisma.$transaction(transactionsDeleteArr).catch((err) => {rej(err)});
   res();
  })
}

//Express
app.use(express.static(ROOT_DIR));
app.use(cookieParser('myAgendaApp'));
app.use(express.json());

app.get('/hello', (req, res) => {
  res.sendFile(ROOT_DIR + "/index.html")
})

app.use(async (req, res, next) => {
  if (!req.signedCookies.refreshToken) {
      next();
      return;
  }
  let refreshToken = req.signedCookies.refreshToken!;
  let authInstance = authClient;
  authInstance.setCredentials({refresh_token: refreshToken});
  res.locals.auth = authInstance;
  res.locals.userId = req.signedCookies.userId;
  next();
})


app.get('/google-url',(req, res) => {
  res.send(GoogleRedirectURL);
})

app.get('/oauth2callback', ash(async (req, res) => { //not part of api listens to google redirect uri
  let {userId, refreshToken} = await retrieveToken(req.query.code as string);
  await createUser(userId);
  res.cookie('userId',userId, {maxAge: 999*999*999*999,signed: true,httpOnly: true, secure: true});
  res.cookie('refreshToken',refreshToken, {maxAge: 999*999*999*999,signed: true,httpOnly: true, secure: true});
  res.redirect('/');
}))

app.post('/sign-out', ash(async (req, res) => {
  res.clearCookie('refreshToken');
  res.clearCookie('userId');
  res.status(200).send("Sucess!");
}))

app.get('/has-signed-in',ash(async (req,res) => {
  if (!res.locals.auth || !res.locals.userId){ //no cookies
    res.send(false);
    return;
  }  
  if (!(await checkUserExists(res.locals.userId))) { //userid not in database
    res.clearCookie('refreshToken');
    res.clearCookie('userId');
    res.send(false);
    return;
  }
  res.send(true);
}))

app.get('/retrieve-tasks-q',ash(async (req, res) => {
  if (!res.locals.auth){
    throw new Error("User has not yet logged in!");
  } 
  res.send(await retrieveAgendaTasks(res.locals.userId));
}))


app.get('/retrieve-tasks-l',ash(async (req, res) => {
  if (!res.locals.auth){
    throw new Error("User has not yet logged in!");
  } 
  let courseWorkArr = await listCoursework(res.locals.auth);
    //then if doesn't exist store in database
    let readyTasks = await storeGCTasks(res.locals.userId, convertGCTaskArr(courseWorkArr));
    res.send(readyTasks); 
}))

app.post('/create-tasks', ash(async(req, res)=> {
  //request accepts an array
  if (!res.locals.userId) {
    throw new Error("User ID Not Found");
  }
  let tasks = req.body;
  if (!tasks|| !Array.isArray(tasks) ) {
    throw new Error("Tasks Either Don't Exist Or Is Not An Array!");
  }
  let tasksWithID = await createAgendaTasks(res.locals.userId, tasks);
  res.send(tasksWithID);
}))

app.post('/update-tasks', ash(async(req, res)=> {
  if (!res.locals.userId) {
    throw new Error("User ID Not Found");
  }
  let tasks = req.body;
  if (!tasks|| !Array.isArray(tasks) ) {
    throw new Error("Tasks Either Don't Exist Or Is Not An Array!");
  }
  await updateAgendaTasks( tasks);
  res.send("Sucess!");
}))

app.post('/delete-tasks', ash(async(req, res)=> {
  if (!res.locals.userId) {
    throw new Error("User ID Not Found");
  }
  let tasks = req.body;
  if (!tasks|| !Array.isArray(tasks) ) {
    throw new Error("Tasks Either Don't Exist Or Is Not An Array!");
  }
  await deleteAgendaTasks(tasks);
  res.send("Sucess!");
}))

app.get('/list-courses',ash(async(req, res) => { 
  if (!res.locals.auth){
    throw new Error("User has not yet logged in!");
  } 
  res.send(await listGCCourses(res.locals.auth));
}))

app.get('/retrieve-labels', ash(async (req, res)=> {
  if (!res.locals.auth){
    throw new Error("User has not yet logged in!");
  } 
  res.send(await retrieveAgendaLabels(res.locals.userId));
}))

app.post('/create-labels', ash(async(req, res)=> {
  //request accepts an array
  if (!res.locals.userId) {
    throw new Error("User ID Not Found");
  }
  let labels = req.body;
  if (!labels|| !Array.isArray(labels) ) {
    throw new Error("Tasks Either Don't Exist Or Is Not An Array!");
  }
  let tasksWithID = await createAgendaLabels(res.locals.userId, labels);
  res.send(tasksWithID);
}))

app.post('/update-labels', ash(async(req, res)=> {
  if (!res.locals.userId) {
    throw new Error("User ID Not Found");
  }
  let labels = req.body;
  if (!labels|| !Array.isArray(labels) ) {
    throw new Error("Tasks Either Don't Exist Or Is Not An Array!");
  }
  await updateAgendaLabels(labels);
  res.send("Sucess!");
}))

app.post('/delete-labels',ash(async(req, res) => { 
  if (!res.locals.userId){
    throw new Error("User ID Not Found");
  } 
  let labels = req.body;
  if (!labels|| !Array.isArray(labels) ) {
    throw new Error("Labels Either Don't Exist Or Is Not An Array!");
  }
  await deleteAgendaLabels(labels)
  res.send('Sucess'); 
}))

app.use((err: Error,req: Request,res: Response,next: NextFunction)=> { //error handling
  if (err) {
    if (!err.message) {
      console.error("ERROR: " + err);
      res.status(500).send(err.message)
      return;
    }
    console.error("ERROR: " + err.message);
    res.status(500).send(err.message)
  }
})

export default app;
