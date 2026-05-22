using FinalProject.Data;
using FinalProject.DTOs;
using FinalProject.Models;
using FinalProject.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinalProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PasswordService _passwordService;
        private readonly JwtService _jwtService;
        private readonly ActivityLogger _logger;

        public AuthController(
            AppDbContext context,
            PasswordService passwordService,
            JwtService jwtService,
            ActivityLogger logger)
        {
            _context = context;
            _passwordService = passwordService;
            _jwtService = jwtService;
            _logger = logger;
        }

        // POST: /api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterRequestDto request)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (existingUser != null)
            {
                _logger.LogWarning(request.Username, "REGISTER_FAILED", "Username already exists.");
                return BadRequest(new
                {
                    message = "Username already exists."
                });
            }

            var existingEmail = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (existingEmail != null)
            {
                _logger.LogWarning(request.Username, "REGISTER_FAILED", $"Email already in use: {request.Email}");
                return BadRequest(new
                {
                    message = "Email already exists."
                });
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = _passwordService.HashPassword(request.Password),
                IsAdmin = false
            };

            // Generate refresh token
            user.RefreshToken = _jwtService.GenerateRefreshToken();
            user.RefreshTokenExpiryTime = _jwtService.GetRefreshTokenExpiryTime();

            // Save to database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInfo(request.Username, "REGISTER_SUCCESS", $"New user registered. Email: {request.Email}");

            // Generate access token
            var accessToken = _jwtService.GenerateToken(user);

            var response = new AuthResponseDto
            {
                Token = accessToken,
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                IsAdmin = user.IsAdmin
            };

            return Ok(new
            {
                token = response.Token,
                refreshToken = user.RefreshToken,
                id = response.Id,
                username = response.Username,
                email = response.Email,
                isAdmin = response.IsAdmin
            });
        }

        // POST: /api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginRequestDto request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null)
            {
                _logger.LogWarning(request.Username, "LOGIN_FAILED", "User not found.");
                return Unauthorized(new
                {
                    message = "Invalid username or password."
                });
            }

            var isPasswordValid = _passwordService.VerifyPassword(
                request.Password,
                user.PasswordHash
            );

            if (!isPasswordValid)
            {
                _logger.LogWarning(request.Username, "LOGIN_FAILED", "Wrong password attempt.");
                return Unauthorized(new
                {
                    message = "Invalid username or password."
                });
            }

            // Generate new refresh token
            user.RefreshToken = _jwtService.GenerateRefreshToken();
            user.RefreshTokenExpiryTime = _jwtService.GetRefreshTokenExpiryTime();

            // Save updated refresh token
            await _context.SaveChangesAsync();

            _logger.LogInfo(request.Username, "LOGIN_SUCCESS", $"User logged in. IsAdmin={user.IsAdmin}");

            // Generate access token
            var accessToken = _jwtService.GenerateToken(user);

            var response = new AuthResponseDto
            {
                Token = accessToken,
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                IsAdmin = user.IsAdmin
            };

            return Ok(new
            {
                token = response.Token,
                refreshToken = user.RefreshToken,
                id = response.Id,
                username = response.Username,
                email = response.Email,
                isAdmin = response.IsAdmin
            });
        }

        // POST: /api/auth/refresh-token
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

            if (user == null)
            {
                _logger.LogWarning("anonymous", "TOKEN_REFRESH_FAILED", "Invalid refresh token presented.");
                return Unauthorized(new
                {
                    message = "Invalid refresh token."
                });
            }

            if (user.RefreshTokenExpiryTime == null ||
                user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                _logger.LogWarning(user.Username, "TOKEN_REFRESH_FAILED", "Refresh token expired.");
                return Unauthorized(new
                {
                    message = "Refresh token has expired."
                });
            }

            // Generate new access token
            var accessToken = _jwtService.GenerateToken(user);

            // Generate new refresh token (rotation)
            user.RefreshToken = _jwtService.GenerateRefreshToken();
            user.RefreshTokenExpiryTime = _jwtService.GetRefreshTokenExpiryTime();

            // Save new refresh token
            await _context.SaveChangesAsync();

            _logger.LogInfo(user.Username, "TOKEN_REFRESH_SUCCESS", "Access token refreshed via refresh token rotation.");

            return Ok(new
            {
                token = accessToken,
                refreshToken = user.RefreshToken,
                id = user.Id,
                username = user.Username,
                email = user.Email,
                isAdmin = user.IsAdmin
            });
        }

        // GET: /api/auth/me
        // Called by the frontend AuthContext on every page load to restore session.
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            return Ok(new
            {
                id = user.Id,
                username = user.Username,
                email = user.Email,
                isAdmin = user.IsAdmin
            });
        }
    }
}