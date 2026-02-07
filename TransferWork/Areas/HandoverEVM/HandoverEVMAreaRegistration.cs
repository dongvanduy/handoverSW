using System.Web.Mvc;

namespace HandOver.Areas.HandoverEVM
{
    public class HandoverEVMAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "HandoverEVM";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "HandoverEVM_default",
                "HandoverEVM/{controller}/{action}/{id}",
                new { controller = "Works", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}