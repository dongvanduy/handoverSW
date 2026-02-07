using System.Web.Mvc;

namespace HandOver.Areas.HandoverRE
{
    public class HandoverREAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "HandoverRE";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "HandoverRE_default",
                "HandoverRE/{controller}/{action}/{id}",
                new { controller = "Works" ,action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}