using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kora.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCourtIdToSlot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM \"Bookings\";");
            migrationBuilder.Sql("DELETE FROM \"Slots\";");

            migrationBuilder.AddColumn<Guid>(
                name: "CourtId",
                table: "Slots",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Slots_CourtId_StartsAt",
                table: "Slots",
                columns: new[] { "CourtId", "StartsAt" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Slots_Courts_CourtId",
                table: "Slots",
                column: "CourtId",
                principalTable: "Courts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Slots_Courts_CourtId",
                table: "Slots");

            migrationBuilder.DropIndex(
                name: "IX_Slots_CourtId_StartsAt",
                table: "Slots");

            migrationBuilder.DropColumn(
                name: "CourtId",
                table: "Slots");
        }
    }
}
