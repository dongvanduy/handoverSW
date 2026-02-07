using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace HandOver.Common
{
    public class CustomAuthorizeAttribute : AuthorizeAttribute
    {
        public int RoleNum { get; set; } = 0;
        private readonly TransferWorkEntities db = new TransferWorkEntities();
        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            var userLogin = HttpContext.Current.Session[MySession.USER_SESSION];

            // Nếu chưa có session thì bắt đăng nhập:
            if (userLogin == null)
            {
                filterContext.Result = new RedirectToRouteResult(new RouteValueDictionary(new
                {
                    controller = "Login",
                    action = "Login",
                    area = "", // area cần trỏ tới
                }));
                return;
            }
            else
            {
                // đã có session => kiểm tra quyền:
                if (db.Users.SingleOrDefault(u => u.CardID == MySession.USER_SESSION).Role <= RoleNum)
                {
                    filterContext.Result = new RedirectToRouteResult(new RouteValueDictionary(new
                    {
                        controller = "Error",
                        action = "Error500",
                        area = "", // area cần trỏ tới
                    }));
                }
            }
        }
    }
}