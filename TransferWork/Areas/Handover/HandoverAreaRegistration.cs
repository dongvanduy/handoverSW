using System.Web.Mvc;

namespace HandOver.Areas.Handover
{
    public class HandoverAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "Handover";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "Handover_default",
                "Handover/{controller}/{action}/{id}",
                new { controller = "Works" , action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}