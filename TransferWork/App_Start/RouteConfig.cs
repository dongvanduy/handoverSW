using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace HandOver
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
            routes.IgnoreRoute("Views/404.html");

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Login", action = "Index", id = UrlParameter.Optional }
            );
            routes.MapRoute(
               name: "AreaRouter",
               url: "{area}/{controller}/{action}/{id}",
               defaults: new { controller = "Works", action = "Index", area = "HandoverPE", id = UrlParameter.Optional }
           );
            routes.MapRoute(
             name: "Dashboard",
             url: "Manager/Manager/Dashboard/{id}",
             defaults: new { action = "Dashboard", id = UrlParameter.Optional }
         );
        }
    }
}
