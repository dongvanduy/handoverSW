using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace HandOver.Common
{
    public class Function
    {
        public static string GetStringMD5(string input)// Render string to MD5
        {
            StringBuilder hash = new StringBuilder();
            MD5CryptoServiceProvider md5provider = new MD5CryptoServiceProvider();
            byte[] bytes = md5provider.ComputeHash(new UTF8Encoding().GetBytes(input));

            for (int i = 0; i < bytes.Length; i++)
            {
                hash.Append(bytes[i].ToString("x2"));
            }
            return hash.ToString().ToUpper();
        }
        public static string GetTextString(string Input, string Start, string End)// Substring from input
        {
            try
            {
                if (!Input.Contains(Start)) return Input;
                int StartPos = Input.IndexOf(Start) + Start.Length;
                string dataBack = Input.Substring(StartPos, Input.Length - StartPos);
                if(End == "")
                {
                    dataBack = dataBack.Substring(0, dataBack.Length);
                    return dataBack.Trim();
                }
                else
                {
                    dataBack = dataBack.Substring(0, dataBack.IndexOf(End));
                    return dataBack.Trim();
                }                
            }
            catch
            {
                return "";
            }
        }
    }
}