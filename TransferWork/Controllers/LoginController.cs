using HandOver.Common;
using System;
using System.Data.Entity.Migrations;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace HandOver.Controllers
{
    public class LoginController : Controller
    {
        // GET: Login
        private readonly TransferWorkEntities db = new TransferWorkEntities();
        private static readonly HttpClient client = new HttpClient();
        public ActionResult Index()// Login view and check remember login
        {
            return View();
        }
        public async Task<ActionResult> Login(string CardID, string Password, string RememberLogin)// Get login request
        {
            User user = new User();
            user = db.Users.SingleOrDefault(u => u.CardID == CardID);
            if (user == null)
            {
                return Json(new { Status = "No Card ID" });
            }
            else
            {                           
                if (user.Password == "-1")
                {
                    string userData = await GetUserDataAsync(CardID);
                    if (string.IsNullOrWhiteSpace(userData))
                    {
                        return Json(new { Status = "No Card ID" });
                    }

                    string hireDate = Function.GetTextString(userData, "\"HIREDATE\":\"", "\",\"");
                    string cnName = Function.GetTextString(userData, "\"USER_NAME\":\"", "\",\"");
                    string gender = Function.GetTextString(userData, "\"SEX\":\"", "\",\"");

                    DateTime dateStart = DateTime.ParseExact(hireDate, "yyyy/MM/dd", CultureInfo.InvariantCulture);

                    user.Password = hireDate.Replace("/", "");
                    user.StartDate = dateStart;
                    user.CnName = cnName;
                    user.Gender = gender;
                    db.Users.AddOrUpdate(user);
                    db.SaveChanges();
                }

                if (user.Password != Password)
                {
                    return Json(new { Status = "Password Wrong" });
                }
                else
                {                  
                    if(Response.Cookies["UserCookies"] != null)
                    {
                        //DeleteCookie();
                    }
                    CreateSession(user); //add session                   
                    if (bool.Parse(RememberLogin)) //add cookies if remember
                    {
                        CreateCookie(user.CardID, user.Password);
                    }                    
                    switch (user.Department)
                    {
                        case "PE":
                            {
                                return Json(new { Status = "Success", href = Url.Action("Index", "Works", new { area = "HandoverPE" }) });
                            }
                        case "RE":
                            {
                                return Json(new { Status = "Success", href = Url.Action("Index", "Works", new { area = "HandoverRE" }) });
                            }
                        default:
                            {
                                return Json(new { Status = "Success", href = Url.Action("Index", "Works", new { area = "Handover" }) });
                            }
                    }
                }
            }
        } 
        [HttpPost]
        public JsonResult Register(string CardID, string Password, string ConfirmPassword, string Department, string VnName, string EnName)
        {
            if (string.IsNullOrWhiteSpace(CardID) || string.IsNullOrWhiteSpace(Password) || string.IsNullOrWhiteSpace(ConfirmPassword)
                || string.IsNullOrWhiteSpace(Department) || string.IsNullOrWhiteSpace(VnName))
            {
                return Json(new { Status = "Missing Fields" });
            }

            if (Password != ConfirmPassword)
            {
                return Json(new { Status = "Confirm Password Wrong" });
            }

            if (db.Users.Any(u => u.CardID == CardID))
            {
                return Json(new { Status = "Card ID Exists" });
            }

            var user = new User
            {
                CardID = CardID.Trim(),
                Password = Password,
                Department = Department.Trim(),
                VnName = VnName.Trim(),
                EnName = string.IsNullOrWhiteSpace(EnName) ? "N/A" : EnName.Trim(),
                CnName = "N/A",
                Gender = "N/A",
                StartDate = null,
                Role = 3,
                IsActive = 1
            };

            db.Users.Add(user);
            db.SaveChanges();

            return Json(new { Status = "Success" });
        }
        public ActionResult Logout()
        {
            HttpCookie myCookie = new HttpCookie("UserCookies");
            myCookie.Expires = DateTime.Now.AddDays(-1);
            Response.Cookies.Add(myCookie);

            Session.Clear();
            MySession.USER_SESSION = "-1";
            MySession.USER_ROLE = -1;
            MySession.USER_ACTIVE = -1;

            return RedirectToAction("Index", "Login");
        }
        public JsonResult ChangePass(string id, string oldPass, string newPass, string confirm) 
        {
            if(id == MySession.USER_SESSION)
            {
                User temp = db.Users.SingleOrDefault(u => u.CardID == id);
                if (temp.Password == oldPass)
                {
                    if(newPass == confirm)
                    {
                        temp.Password = newPass;
                        db.Users.AddOrUpdate(u => u.CardID, temp);
                        db.SaveChanges();
                        return Json(new { status = "ok" });
                    }
                    else
                    {
                        return Json(new { status = "confirm fail" });
                    }
                }
                else
                {
                    return Json(new { status = "password fail" });
                }               
            }
            else
            {
                return Json(new { status = "fail" });
            }
        }
        public void CreateSession(User user)
        {
            MySession.USER_SESSION = user.CardID;         
            MySession.USER_ACTIVE = (int) user.IsActive;
            MySession.USER_ROLE = user.Role;

            Session[user.CardID] = user;
            Response.Cookies["UserCookies"]["CardID"] = user.CardID;
            Response.Cookies["UserCookies"]["VnName"] = Server.UrlEncode(user.VnName);
            Response.Cookies["UserCookies"]["EnName"] = user.EnName;
            Response.Cookies["UserCookies"]["CnName"] = Server.UrlEncode(user.CnName);
            Response.Cookies["UserCookies"]["Depart"] = user.Department;
            Response.Cookies["UserCookies"]["Role"] = user.Role.ToString();
        }
        public void CreateCookie(string CardID, string Password)
        {
            Response.Cookies["UserCookies"]["Password"] = Function.GetStringMD5(Password);
            Response.Cookies["UserCookies"]["LoginTime"] = DateTime.Now.ToString("yyyy/MM/dd HH:MM:ss");
            Response.Cookies["UserCookies"].Expires = DateTime.Now.AddDays(15);
        }

        private async Task<string> GetUserDataAsync(string CardID)
        {
            try
            {
                string url = "http://10.224.69.100:8080/postman/api/hr/getEmpObj?id=" + CardID;
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                string responseBody = await response.Content.ReadAsStringAsync();
                return responseBody;
            }
            catch (HttpRequestException)
            {
                return "";
            }
        }
    }
   
}
