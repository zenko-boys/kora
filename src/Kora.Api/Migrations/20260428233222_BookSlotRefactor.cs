using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kora.Api.Migrations
{
    /// <inheritdoc />
    public partial class BookSlotRefactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Slots_Courts_CourtId",
                table: "Slots");

            migrationBuilder.DropIndex(
                name: "IX_Slots_CourtId",
                table: "Slots");

            migrationBuilder.DropIndex(
                name: "IX_Slots_CourtId_StartsAt_EndsAt",
                table: "Slots");

            migrationBuilder.DropColumn(
                name: "CourtId",
                table: "Slots");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CourtId",
                table: "Slots",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Slots_CourtId",
                table: "Slots",
                column: "CourtId");

            migrationBuilder.CreateIndex(
                name: "IX_Slots_CourtId_StartsAt_EndsAt",
                table: "Slots",
                columns: new[] { "CourtId", "StartsAt", "EndsAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_Slots_Courts_CourtId",
                table: "Slots",
                column: "CourtId",
                principalTable: "Courts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
