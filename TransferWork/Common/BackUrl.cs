using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HandOver.Common
{
    public class BackUrl
    {

        public static string AREA = "";
        public static string CONTROLLER = "";
        public static string ACTION = "";

        public static void SaveURL(string area, string controller, string action)
        {
            AREA = area;
            CONTROLLER = controller;
            ACTION = action;
        }
    }
}