using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kora.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDayUseAndPublish : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CourtsOccupied",
                table: "Slots",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "Slots",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CourtsOccupied",
                table: "Slots");

            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "Slots");
        }
    }
}
