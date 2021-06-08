//API Documentation
//Check dts-apidocs.d.ts for the AgendaTask type

export default [
  {
    name: 'Get Google URL',
    url: 'api/google-url',
    type: 'get',
    description: 'Retrieve Google Sign In URL from the API. In front end once user clicks sign in button, script redirects to the returned url',
    'required-input-type': 'none',
    'returned-datatype': 'string'
  },
  {
    name: 'Has User Signed In?',
    url: 'api/has-signed-in',
    type: 'get',
    description: 'Call this before you start retrieving tasks. Ideally call this once per refresh..',
    'required-input-type': 'none',
    'returned-datatype': 'boolean'
  },
  {
    name: 'Sign User Out',
    url: 'api/sign-out',
    type: 'post',
    description: 'Call this to sign user out, it does not remove users from database, only removes cookies like userid',
    'required-input-type': 'none',
    'returned-datatype': 'none' //technically its a text but assume its void
  },
  {
    name: 'Quick Task Retrieval',
    url: 'api/retrieve-tasks-q',
    type: 'get',
    description: 'Call this first, then the long task retrieval. Returns list of task stored in the database.',
    'required-input-type': 'none',
    'returned-datatype': 'AgendaTask[]' //'[]' means array!!
  },
  {
    name: 'Long Task Retrieval',
    url: 'api/retrieve-tasks-l',
    type: 'get',
    description: 'Retrieve tasks the long way, essentially retrieve classroom coursework from GC, stores them in db, then retrieve the combined tasks',
    'required-input-type': 'none',
    'returned-datatype': 'AgendaTask[]'
  },
  {
    name: 'Create Tasks',
    url: 'api/create-tasks',
    type: 'post',
    description: 'Unlike, both update and delete, this request will return agenda tasks but this time with userId defined (defined by prisma orm cuid)',
    'required-input-type': 'AgendaTask[]', //make sure to set user id to undefined
    'returned-datatype': 'AgendaTask[]'
  },
  {
    name: 'Update Tasks',
    url: 'api/update-tasks',
    type: 'post',
    description: 'Update Tasks will accept an AgendaTask array with a defined task id and update the task content in the database',
    'required-input-type': 'AgendaTask[]', //make sure to not update GC task dates (including hasDueTime, etc.)!!
    //The front end should not allow GC task dates to be changed, and also GC title cannot be changed
    'returned-datatype': 'none'
  },
  {
    name: 'Delete Tasks',
    url: 'api/delete-tasks',
    type: 'post',
    description: 'Delete an array of tasks from the database',
    'required-input-type': 'AgendaTask[]', //not to be confused with isCompleted property of AgendaTask
    //front end should give the option for users to either mark a task as done (task will be grayed out for example), or to completely delete a task
    'returned-datatype': 'none'
  },
  {
    name: 'List Courses',
    url: 'api/list-courses',
    type: 'get',
    description: 'List an array of GC Courses. course.id to access id, course.name to access name',
    'required-input-type': '',
    'returned-datatype': 'classroomCourses[]'
  },
  {
    name: 'Retrieve Labels',
    url: 'api/retrieve-labels',
    type: 'get',
    description: 'Retrieves Labels',
    'required-input-type': '',
    'returned-datatype': 'AgendaLabel[]'
  },
  {
    name: 'Create Labels',
    url: 'api/create-labels',
    type: 'post',
    description: 'Create Labels if label id is undefined, Returns AgendaLabels with defined IDs',
    'required-input-type': 'AgendaLabel[]',
    'returned-datatype': 'AgendaLabel[]'
  },
  {
    name: 'Update Labels',
    url: 'api/update-labels',
    type: 'post',
    description: 'Updates Labels if label id is defined, Returns AgendaLabels with defined IDs',
    'required-input-type': 'AgendaLabel[]',
    'returned-datatype': 'none'
  },
  {
    name: 'Delete Labels',
    url: 'api/delete-labels',
    type: 'post',
    description: 'Delete an array of labels',
    'required-input-type': 'AgendaLabel[]',
    'returned-datatype': ''
  }
]
