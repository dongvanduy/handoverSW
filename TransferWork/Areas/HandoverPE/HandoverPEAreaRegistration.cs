using System.Web.Mvc;

namespace HandOver.Areas.HandoverPE
{
    public class HandoverPEAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "HandoverPE";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "HandoverPE_default",
                "HandoverPE/{controller}/{action}/{id}",
                new {controller = "Works", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}