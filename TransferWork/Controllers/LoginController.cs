using System;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;
using System.Web.Security;
using HandOver.Common;

namespace HandOver.Controllers
{
    public class LoginController : Controller
    {
        // GET: Login
        private readonly TransferWorkEntities db = new TransferWorkEntities();
        static readonly HttpClient client = new HttpClient();
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
                    string UserData = await GetUserDataAsync(CardID);
                    if (UserData != "")
                    {
                        string hireDate = Function.GetTextString(UserData, "\"HIREDATE\":\"", "\",\"");
                        DateTime dateStart = DateTime.ParseExact(hireDate, "yyyy/MM/dd", CultureInfo.InvariantCulture);
                        string CnName = Function.GetTextString(UserData, "\"USER_NAME\":\"", "\",\"");
                        string Gender = Function.GetTextString(UserData, "\"SEX\":\"", "\",\"");

                        user.Password = hireDate.Replace("/", "").Substring(2);
                        user.StartDate = dateStart;
                        user.CnName = CnName;
                        user.Gender = Gender;
                        db.Users.AddOrUpdate(user);
                        db.SaveChanges();
                    }
                    else
                    {
                        return Json(new { Status = "No Card ID" });
                    }
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
                string url = "http://10.224.69.100/postman/api/hr/getEmpObj?id=" + CardID;
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                string responseBody = await response.Content.ReadAsStringAsync();
                return responseBody;
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine("\nException Caught!");
                Console.WriteLine("Message :{0} ", e.Message);
                return "";
            }
        }
    }
   
}