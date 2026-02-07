using HandOver.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace HandOver.Areas
{
    public class BaseController : Controller
    {
        protected override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            //Areas.HanoverRE
            User session = (User)Session[MySession.USER_SESSION];
            if (session == null)
            {
                filterContext.Result =
                        new RedirectToRouteResult(
                            new RouteValueDictionary(
                                new { area = "", controller = "Login", action = "Index" }));
            }
            else
            {
                if(session.Role == 1)
                {
                    base.OnActionExecuted(filterContext);
                }
                else if (session.Department == "PE")
                {
                    if (filterContext.Controller.ToString().Contains("Areas.HandoverRE"))
                    {
                        filterContext.Result =
                            new RedirectToRouteResult(
                                new RouteValueDictionary(
                                    new { area = "", controller = "Error", action = "Error404" }));
                    }
                    base.OnActionExecuted(filterContext);
                }
                else if (session.Department == "RE")
                {
                    if (filterContext.Controller.ToString().Contains("Areas.HandoverPE"))
                    {
                        filterContext.Result =
                            new RedirectToRouteResult(
                                new RouteValueDictionary(
                                    new { area = "", controller = "Error", action = "Error404" }));
                    }
                    base.OnActionExecuted(filterContext);
                }                
            }
        }
    }
}