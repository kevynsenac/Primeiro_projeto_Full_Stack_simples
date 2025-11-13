using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CorridaApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tb_corridas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Data = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DistanciaKm = table.Column<decimal>(type: "decimal(10, 2)", precision: 10, scale: 2, nullable: false),
                    TempoMinutos = table.Column<int>(type: "INTEGER", nullable: false),
                    Local = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_corridas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tb_usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nome = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    SenhaHash = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_usuarios", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_tb_usuarios_Email",
                table: "tb_usuarios",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tb_corridas");

            migrationBuilder.DropTable(
                name: "tb_usuarios");
        }
    }
}
