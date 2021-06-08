-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "courseName" TEXT,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Label" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
