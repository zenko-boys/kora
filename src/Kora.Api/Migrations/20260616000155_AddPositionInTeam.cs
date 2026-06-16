using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kora.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPositionInTeam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PositionInTeam",
                table: "BookingParticipants",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PositionInTeam",
                table: "BookingGuests",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PositionInTeam",
                table: "BookingParticipants");

            migrationBuilder.DropColumn(
                name: "PositionInTeam",
                table: "BookingGuests");
        }
    }
}
