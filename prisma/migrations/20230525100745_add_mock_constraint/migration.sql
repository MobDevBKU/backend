-- CreateTable
CREATE TABLE "_RouteToStop" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RouteToStop_AB_unique" ON "_RouteToStop"("A", "B");

-- CreateIndex
CREATE INDEX "_RouteToStop_B_index" ON "_RouteToStop"("B");

-- AddForeignKey
ALTER TABLE "_RouteToStop" ADD CONSTRAINT "_RouteToStop_A_fkey" FOREIGN KEY ("A") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RouteToStop" ADD CONSTRAINT "_RouteToStop_B_fkey" FOREIGN KEY ("B") REFERENCES "Stop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
