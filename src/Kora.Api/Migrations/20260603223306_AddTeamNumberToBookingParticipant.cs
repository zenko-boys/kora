using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kora.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTeamNumberToBookingParticipant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TeamNumber",
                table: "BookingParticipants",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TeamNumber",
                table: "BookingParticipants");
        }
    }
}
