using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kora.Api.Migrations
{
    /// <inheritdoc />
    public partial class RenameTeamNumberToTeam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TeamNumber",
                table: "BookingParticipants",
                newName: "Team");

            migrationBuilder.RenameColumn(
                name: "TeamNumber",
                table: "BookingGuests",
                newName: "Team");

            migrationBuilder.Sql("UPDATE \"BookingParticipants\" SET \"Team\" = 'TeamA' WHERE \"Team\" = 'Team1'");
            migrationBuilder.Sql("UPDATE \"BookingParticipants\" SET \"Team\" = 'TeamB' WHERE \"Team\" = 'Team2'");
            migrationBuilder.Sql("UPDATE \"BookingGuests\" SET \"Team\" = 'TeamA' WHERE \"Team\" = 'Team1'");
            migrationBuilder.Sql("UPDATE \"BookingGuests\" SET \"Team\" = 'TeamB' WHERE \"Team\" = 'Team2'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE \"BookingParticipants\" SET \"Team\" = 'Team1' WHERE \"Team\" = 'TeamA'");
            migrationBuilder.Sql("UPDATE \"BookingParticipants\" SET \"Team\" = 'Team2' WHERE \"Team\" = 'TeamB'");
            migrationBuilder.Sql("UPDATE \"BookingGuests\" SET \"Team\" = 'Team1' WHERE \"Team\" = 'TeamA'");
            migrationBuilder.Sql("UPDATE \"BookingGuests\" SET \"Team\" = 'Team2' WHERE \"Team\" = 'TeamB'");

            migrationBuilder.RenameColumn(
                name: "Team",
                table: "BookingParticipants",
                newName: "TeamNumber");

            migrationBuilder.RenameColumn(
                name: "Team",
                table: "BookingGuests",
                newName: "TeamNumber");
        }
    }
}
