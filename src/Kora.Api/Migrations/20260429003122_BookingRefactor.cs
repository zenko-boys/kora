using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kora.Api.Migrations
{
    /// <inheritdoc />
    public partial class BookingRefactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SlotParticipants");

            migrationBuilder.DropIndex(
                name: "IX_Slots_ClubId_StartsAt_EndsAt",
                table: "Slots");

            migrationBuilder.DropColumn(
                name: "Capacity",
                table: "Slots");

            migrationBuilder.DropColumn(
                name: "CourtsOccupied",
                table: "Slots");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Slots");

            migrationBuilder.RenameColumn(
                name: "StandardSlotDurationMinutes",
                table: "Clubs",
                newName: "SlotCellDurationMinutes");

            migrationBuilder.AddColumn<Guid>(
                name: "BookingId",
                table: "Slots",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinimumBookingDurationMinutes",
                table: "Clubs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClubId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    StartsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Capacity = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookings_Clubs_ClubId",
                        column: x => x.ClubId,
                        principalTable: "Clubs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BookingParticipants",
                columns: table => new
                {
                    BookingId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingParticipants", x => new { x.BookingId, x.UserId });
                    table.ForeignKey(
                        name: "FK_BookingParticipants_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Slots_BookingId",
                table: "Slots",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_Slots_ClubId_StartsAt",
                table: "Slots",
                columns: new[] { "ClubId", "StartsAt" });

            migrationBuilder.CreateIndex(
                name: "IX_BookingParticipants_UserId",
                table: "BookingParticipants",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ClubId",
                table: "Bookings",
                column: "ClubId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ClubId_StartsAt_EndsAt",
                table: "Bookings",
                columns: new[] { "ClubId", "StartsAt", "EndsAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_Slots_Bookings_BookingId",
                table: "Slots",
                column: "BookingId",
                principalTable: "Bookings",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Slots_Bookings_BookingId",
                table: "Slots");

            migrationBuilder.DropTable(
                name: "BookingParticipants");

            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Slots_BookingId",
                table: "Slots");

            migrationBuilder.DropIndex(
                name: "IX_Slots_ClubId_StartsAt",
                table: "Slots");

            migrationBuilder.DropColumn(
                name: "BookingId",
                table: "Slots");

            migrationBuilder.DropColumn(
                name: "MinimumBookingDurationMinutes",
                table: "Clubs");

            migrationBuilder.RenameColumn(
                name: "SlotCellDurationMinutes",
                table: "Clubs",
                newName: "StandardSlotDurationMinutes");

            migrationBuilder.AddColumn<int>(
                name: "Capacity",
                table: "Slots",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CourtsOccupied",
                table: "Slots",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Slots",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "SlotParticipants",
                columns: table => new
                {
                    SlotId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SlotParticipants", x => new { x.SlotId, x.UserId });
                    table.ForeignKey(
                        name: "FK_SlotParticipants_Slots_SlotId",
                        column: x => x.SlotId,
                        principalTable: "Slots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Slots_ClubId_StartsAt_EndsAt",
                table: "Slots",
                columns: new[] { "ClubId", "StartsAt", "EndsAt" });

            migrationBuilder.CreateIndex(
                name: "IX_SlotParticipants_UserId",
                table: "SlotParticipants",
                column: "UserId");
        }
    }
}
