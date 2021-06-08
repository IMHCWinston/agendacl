-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TEXT,
    "hasDueTime" BOOLEAN NOT NULL,
    "hasDueDate" BOOLEAN NOT NULL,
    "isCompleted" BOOLEAN NOT NULL,
    "isClassroomCourseWork" BOOLEAN NOT NULL,
    "courseWorkLink" TEXT,
    "courseWorkId" TEXT,
    "courseId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Task.courseWorkId_unique" ON "Task"("courseWorkId");

-- AddForeignKey
ALTER TABLE "Task" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
