using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Web.Mvc;
using System.Web.UI.WebControls;
using HandOver.Common;
using OfficeOpenXml;
using System.IO;
using OfficeOpenXml.Style;
using System.Drawing;
using Image = System.Drawing.Image;
using OfficeOpenXml.Drawing;
using System.Windows.Media.Media3D;
using System.Web.Security;

namespace HandOver.Areas.Handover.Controllers
{
    public class WorksController : BaseController
    {
        private readonly TransferWorkEntities db = new TransferWorkEntities();
        List<Work> ListWorks = new List<Work>();
        List<User> ListUsers = new List<User>();
        // GET: Owner PE - RE/Works
        public ActionResult Index()
        {
            ViewBag.Role = MySession.USER_ROLE;
            return View();
        }
        public JsonResult GetListWork()
        {
            try
            {
                ListWorks = db.Works.OrderBy(s => s.ID).Where(w => w.Flow == "PE-RE" || w.Flow == "RE-PE").ToList();
                ListUsers = db.Users.ToList();

                var infoUser = ListUsers.Where(u => u.CardID != MySession.USER_SESSION)
                                        .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName });
                for (int i = 0; i < ListWorks.Count; i++)
                {
                    ListWorks[i].OwnerRequest = JsonConvert.SerializeObject(ListUsers.Where(u => u.CardID == ListWorks[i].OwnerRequest)
                            .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName }));

                    List<string> ownerRcIDList = ListWorks[i].OwnerReceive.Split(',').ToList();
                    List<object> userList = ownerRcIDList
                        .Join(ListUsers, rcId => rcId, us => us.CardID, (rcId, us) => new { us.Department, us.CardID, us.VnName, us.EnName, us.CnName })
                        .ToList<object>();
                    ListWorks[i].OwnerReceive = JsonConvert.SerializeObject(userList);
                }
                //check result
                if (ListWorks.Count < 1)
                {
                    return Json(new { Status = "fail", err = "Server get list work = null!", infoUser = infoUser }, JsonRequestBehavior.AllowGet);
                }
                if (infoUser == null)
                {
                    return Json(new { Status = "fail", err = "Server get list user = null" }, JsonRequestBehavior.AllowGet);
                }
                List<Model> models = db.Models1.ToList();
                return Json(new { status = "success", data = ListWorks, infoUser = infoUser, modelList = models }, JsonRequestBehavior.AllowGet);
            }
            catch
            {
                return Json(new { Status = "fail", err = "Get list work from server fail!" }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult AddWork(Work work)
        {
            string valiStatus = ValidationWork(work);
            if (valiStatus != "success")
            {
                return Json(new { error = valiStatus });
            }
            string depReq;
            string depRec;
            try
            {
                depReq = db.Users.SingleOrDefault(u => u.CardID == work.OwnerRequest).Department;
                depRec = db.Users.SingleOrDefault(u => u.CardID == work.OwnerReceive).Department;

                if ((depReq == "PE" && depRec != "RE") || (depReq == "RE" && depRec != "PE"))
                    return Json(new { status = "Wrong Depart" });
            }
            catch
            {
                return Json(new { status = "CARD ID FAIL" });
            }
            work.Flow = depReq + "-" + depRec;
            #region Save to database
            try
            {
                work.OwnerReceive.Replace(",", ", ");
                db.Works.Add(work);
                AddOrUpdateModel(work.Model);
                db.SaveChanges();

                ListUsers = db.Users.ToList();
                work.OwnerRequest = JsonConvert.SerializeObject(ListUsers.Where(u => u.CardID == work.OwnerRequest)
                        .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName }));

                List<string> ownerRcIDList = work.OwnerReceive.Split(',').ToList();
                List<object> userList = ownerRcIDList
                    .Join(ListUsers, rcId => rcId, us => us.CardID, (rcId, us) => new { us.Department, us.CardID, us.VnName, us.EnName, us.CnName })
                    .ToList<object>();
                work.OwnerReceive = JsonConvert.SerializeObject(userList);

                return Json(new { success = true, dataRow = work, model = db.Models1.ToList() });
            }
            catch
            {
                return Json(new { error = "Add work failed. Please double check or contact the administrator!" });
            }
            #endregion
        }
        public JsonResult EditWork(Work work, string changeTime, string userChange)
        {
            var record = db.Works.FirstOrDefault(r => r.ID == work.ID);

            string valiStatus = ValidationWork(work);
            if (valiStatus != "success")
            {
                return Json(new { error = ValidationWork(work) });
            }
            string depReq;
            string depRec;
            try
            {
                depReq = db.Users.SingleOrDefault(u => u.CardID == work.OwnerRequest).Department;
                depRec = db.Users.SingleOrDefault(u => u.CardID == work.OwnerReceive).Department;

                if ((depReq == "PE" && depRec != "RE") || (depReq == "RE" && depRec != "PE"))
                    return Json(new { status = "Wrong Depart" });
            }
            catch
            {
                return Json(new { status = "CARD ID FAIL" });
            }
            work.Flow = depReq + "-" + depRec;

            Work _old = db.Works.SingleOrDefault(w => w.ID == work.ID);
            work.HistoryLog = CreateChangeLog(userChange, changeTime, _old, work);
            #region Save to database
            try
            {
                db.Works.AddOrUpdate(w => w.ID, work);
                AddOrUpdateModel(work.Model);
                db.SaveChanges();

                ListUsers = db.Users.ToList();
                work.OwnerRequest = JsonConvert.SerializeObject(ListUsers.Where(u => u.CardID == work.OwnerRequest)
                        .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName }));
                List<string> ownerRcIDList = work.OwnerReceive.Split(',').ToList();
                List<object> userList = ownerRcIDList
                    .Join(ListUsers, rcId => rcId, us => us.CardID, (rcId, us) => new { us.Department, us.CardID, us.VnName, us.EnName, us.CnName })
                    .ToList<object>();
                work.OwnerReceive = JsonConvert.SerializeObject(userList);
                return Json(new { success = true, dataRow = work, model = db.Models1.ToList() });
            }
            catch (Exception ex)
            {
                return Json(new { error = "Edit work failed. Please double check or contact the administrator!" });
            }
            #endregion
        }
        public JsonResult DeleteWork(int id)
        {
            var record = db.Works.FirstOrDefault(r => r.ID == id);

            try
            {
                db.Works.Remove(record);
                db.SaveChanges();
                return Json(new { success = true });
            }
            catch
            {
                return Json(new { error = "Delete work failed. Please double check or contact the administrator!" });
            }
        }
        public JsonResult GetWork(int id)
        {
            if (id == 0)
                return Json(new { error = "ID record is null. Please double check or contact to administrator!" }, JsonRequestBehavior.AllowGet);

            Work record = db.Works.SingleOrDefault(r => r.ID == id);
            if (record == null)
                Json(new { error = "Get work failed. Please double check or contact the administrator!" });

            ListUsers = db.Users.ToList();
            var userReq = JsonConvert.SerializeObject(ListUsers.Where(u => u.CardID == record.OwnerRequest)
                       .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName }));

            List<string> ownerRcIDList = record.OwnerReceive.Split(',').ToList();
            List<object> userList = ownerRcIDList
                .Join(ListUsers, rcId => rcId, us => us.CardID, (rcId, us) => new { us.Department, us.CardID, us.VnName, us.EnName, us.CnName })
                .ToList<object>();
            var userRec = JsonConvert.SerializeObject(userList);

            return Json(new { success = "success", data = record, userReq = userReq, userRec = userRec }, JsonRequestBehavior.AllowGet);
        }
        // function
        private string ValidationWork(Work work)
        {
            if (work.OwnerRequest == null || work.OwnerReceive == null)
                return "Owner request or Owner receive is null. Please double check!";
            if (work.OwnerReceive == work.OwnerRequest)
                return "Owner request and Owner Receive have the same Card ID. Please double check!";

            if (work.DateStart < new DateTime(2000, 01, 01))
                return "Date Start less than 2000-01-01";
            if (work.DueDate < work.DateStart)
                return "Due Date less than Start Date";

            if (work.Type == null)
                return "Type of record is null. Please double check!";
            if (work.Status == null)
                return "Status of record is null ";
            return "success";
        }
        private void AddOrUpdateModel(string modelName)
        {
            if (modelName != null)
            {
                Model md = db.Models1.FirstOrDefault(e => e.Model_ == modelName);
                if (md == null)
                {
                    md = new Model();
                    md.Model_ = modelName;
                    db.Models1.Add(md);
                }
            }
        }
        private string CreateChangeLog(string userChange, string changeTime, Work oldWork, Work newWork)
        {
            var propertiesToCheck = new[]
            {
                new {Name = "Status", Action = "Status"},
                new {Name = "Type", Action = "Type"},
                new {Name = "DateStart", Action = "Date"},
                new {Name = "DueDate", Action = "Due Date"},
                new {Name = "CTF", Action = "CTF"},
                new {Name = "Model", Action = "Model"},
                new {Name = "OwnerRequest", Action = "Owner Request"},
                new {Name = "OwnerReceive", Action = "Owner Receive"},
                new {Name = "WorkDes", Action = "Works"},
                new {Name = "Detail", Action = "Result"}
             };

            var logEntries = new List<JObject>();
            foreach (var prop in propertiesToCheck)
            {
                var oldValue = oldWork.GetType().GetProperty(prop.Name).GetValue(oldWork, null)?.ToString();
                var newValue = newWork.GetType().GetProperty(prop.Name).GetValue(newWork, null)?.ToString();
                if (oldValue != newValue)
                {
                    logEntries.Add(new JObject(
                        new JProperty("User", userChange),
                        new JProperty("Action", prop.Action),
                        new JProperty("Old", oldValue),
                        new JProperty("New", newValue)
                    ));
                }
            }

            var logObject = new JObject();
            if (oldWork.HistoryLog != null)
            {
                logObject = JObject.Parse(oldWork.HistoryLog);
            }

            JArray logEntriesArray;
            if (logObject.ContainsKey(changeTime))
            {
                logEntriesArray = (JArray)logObject[changeTime];
            }
            else
            {
                logEntriesArray = new JArray();
                logObject.Add(changeTime, logEntriesArray);
            }

            logEntriesArray.Add(logEntries);

            return logObject.ToString();
        }
        //Excel function
        public ActionResult ExportExcel(int[] _ids, string _date, string _owner)
        {
            #region Validate
            if (_ids.Length < 1) return Json(new { error = true, message = "No record. Please filter table!" });
            if (_date == "") return Json(new { error = true, message = "No find date. Please reload page or contact us!" });
            #endregion

            #region Create File
            string folderPath = $"D:\\Handover_Excel_Folder";
            string filePath = $"D:\\Handover_Excel_Folder\\WorkTable_{_date}.xlsx";

            // Check folder exists
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
                Console.WriteLine("Folder created at: " + folderPath);
            }
            // Delete old file
            foreach (string file in Directory.GetFiles(folderPath))
            {
                System.IO.File.Delete(file);
            }
            // Create new file
            FileInfo newFile = new FileInfo(filePath);
            if (newFile.Exists)
            {
                newFile.Delete();
                newFile = new FileInfo(filePath);
            }
            #endregion

            #region Draw Excel
            /*  EXCEL   */

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            ExcelPackage package = new ExcelPackage(newFile);
            ExcelWorksheet worksheet = package.Workbook.Worksheets.Add("Handover System");
            //1. Global style
            {
                worksheet.Cells.Style.Font.Name = "Calibri";
                worksheet.Cells.Style.Font.Size = 12;
                worksheet.Cells.Style.Fill.PatternType = ExcelFillStyle.Solid;
                worksheet.Cells.Style.Fill.BackgroundColor.SetColor(Color.Transparent);
                worksheet.Cells.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                worksheet.Cells.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                //1.1. Set width column
                {
                    worksheet.Column(1).Width = PixelWidthToExcel(65);
                    worksheet.Column(2).Width = PixelWidthToExcel(130);
                    worksheet.Column(2).Style.WrapText = true;
                    worksheet.Column(3).Width = PixelWidthToExcel(70);
                    worksheet.Column(4).Width = PixelWidthToExcel(150);
                    worksheet.Column(5).Width = PixelWidthToExcel(70);
                    worksheet.Column(6).Width = PixelWidthToExcel(350);
                    worksheet.Column(6).Style.WrapText = true;
                    worksheet.Column(6).Style.Numberformat.Format = "@";
                    worksheet.Column(7).Width = PixelWidthToExcel(220);
                    worksheet.Column(7).Style.WrapText = true;
                    worksheet.Column(8).Width = PixelWidthToExcel(220);
                    worksheet.Column(8).Style.WrapText = true;
                    worksheet.Column(9).Width = PixelWidthToExcel(130);
                    worksheet.Column(10).Width = PixelWidthToExcel(85);
                    worksheet.Column(11).Width = PixelWidthToExcel(350);
                    worksheet.Column(11).Style.WrapText = true;
                }
                // 1.2. Header
                {
                    ExcelRange cell = worksheet.Cells["A1:K2"];
                    cell.Merge = true;
                    cell.Value = "WORK LIST";
                    cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    cell.Style.Fill.BackgroundColor.SetColor(Color.DodgerBlue);
                    cell.Style.Font.Size = 16;
                    cell.Style.Font.Color.SetColor(Color.White);
                    cell.Style.Font.Bold = true;
                    cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    cell.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                }
                // 1.3. Info
                {
                    worksheet.Cells["A3:K5"].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                    worksheet.Cells["K3"].RichText.Add("Created: ").Bold = true;
                    worksheet.Cells["K3"].RichText.Add(_owner).Bold = false;

                    worksheet.Cells["K4"].RichText.Add("Date     : ").Bold = true;
                    worksheet.Cells["K4"].RichText.Add(_date).Bold = false;
                    
                    worksheet.Cells["K5"].Value = "2023 © MBD A-IOT";
                    worksheet.Cells["K5"].Style.Font.Bold = true;
                    worksheet.Cells["K5"].Style.Font.Italic = true;

                    FileInfo image = new FileInfo(Server.MapPath(@"~\MyAssets\image\fii-logo.jpg"));
                    ExcelPicture excelImage = worksheet.Drawings.AddPicture("Logo", image);
                    excelImage.SetPosition(2, 0, 0, 0);
                    excelImage.SetSize(65, 60);

                    worksheet.Cells["A3"].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    worksheet.Cells["A4"].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    worksheet.Cells["A5"].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                }
                // 1.4. Table Head
                {
                    ExcelRange cells = worksheet.Cells["A6:K6"];
                    cells.Style.Font.Bold = true;
                    cells.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    cells.Style.Fill.BackgroundColor.SetColor(Color.YellowGreen);
                    worksheet.Cells["A6"].Value = "ID";
                    worksheet.Cells["B6"].Value = "Date";
                    worksheet.Cells["C6"].Value = "CTF";
                    worksheet.Cells["D6"].Value = "Model";
                    worksheet.Cells["E6"].Value = "Type";
                    worksheet.Cells["F6"].Value = "Work";
                    worksheet.Cells["G6"].Value = "Owner Request";
                    worksheet.Cells["H6"].Value = "Owner Receive";
                    worksheet.Cells["I6"].Value = "Due Date";
                    worksheet.Cells["J6"].Value = "Status";
                    worksheet.Cells["K6"].Value = "Result";

                    cells.AutoFilter = true;

                    // Set border cho từng ô
                    foreach (var cell in cells)
                    {
                        cell.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                        cell.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        cell.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                        cell.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    }
                }
            }

            //2. Export data to file
            {
                // in excel, number start is 1 => row start = 7
                int rowStart = 7;
                for (int i = 0; i < _ids.Count(); i++)
                {
                    int row = i + rowStart;
                    int id = _ids[i];
                    Work work = db.Works.SingleOrDefault(w => w.ID == id);
                    if (work != null)
                    {
                        worksheet.Cells[$"A{row}"].Value = work.ID;
                        worksheet.Cells[$"A{row}"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                        worksheet.Cells[$"B{row}"].Value = $"{work.DateStart.ToString("yyyy-MM-dd")}";
                        worksheet.Cells[$"B{row}"].Value += $"\n{work.DateStart.ToString("HH:mm")}";

                        worksheet.Cells[$"C{row}"].Value = $"{work.CTF ?? ""}";
                        worksheet.Cells[$"C{row}"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                        worksheet.Cells[$"D{row}"].Value = $"{work.Model ?? ""}";
                        worksheet.Cells[$"D{row}"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                        worksheet.Cells[$"E{row}"].Value = $"{work.Type ?? ""}";
                        worksheet.Cells[$"E{row}"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                        // Work
                        try
                        {
                            worksheet.Cells[$"F{row}"].Value = "";
                            object workJson = JsonConvert.DeserializeObject<Dictionary<int, string>>(work.WorkDes);
                            int count = 0;
                            foreach (var item in (Dictionary<int, string>)workJson)
                            {
                                if (count > 0)
                                {
                                    worksheet.Cells[$"F{row}"].Value += $"\n{item.Key}. Value: {item.Value}";
                                }
                                else
                                {
                                    worksheet.Cells[$"F{row}"].Value += $"{item.Key}. Value: {item.Value}";
                                }
                                count++;
                            }
                            count = 0;
                        }
                        catch
                        {
                            worksheet.Cells[$"F{row}"].Value = $"{work.WorkDes ?? ""}";
                        }
                        // User request
                        {
                            User userRq = db.Users.SingleOrDefault(u => u.CardID == work.OwnerRequest);
                            if (userRq != null)
                            {
                                worksheet.Cells[$"G{row}"].Value = $"{userRq.Department} | {userRq.CardID}\n";
                                worksheet.Cells[$"G{row}"].Value += $"{userRq.CnName} | {userRq.VnName}";
                            }
                            else
                            {
                                worksheet.Cells[$"G{row}"].Value = $"";
                            }
                        }
                        // User Receive
                        {
                            string[] idArr = work.OwnerReceive.Split(',');
                            if (idArr.Length > 1)
                            {
                                for (int j = 0; j < idArr.Length; j++)
                                {
                                    string this_id = idArr[j].Trim();
                                    User userRc = db.Users.SingleOrDefault(u => u.CardID == this_id);
                                    if (userRc != null)
                                    {
                                        worksheet.Cells[$"H{row}"].Value += $"{userRc.Department} | {userRc.CardID}\n";
                                        worksheet.Cells[$"H{row}"].Value += $"{userRc.CnName} | {userRc.VnName}";
                                        if (j < idArr.Length - 1) worksheet.Cells[$"H{row}"].Value += "\n";
                                    }
                                }
                            }
                            else
                            {
                                User userRc = db.Users.SingleOrDefault(u => u.CardID == work.OwnerReceive);
                                if (userRc != null)
                                {
                                    worksheet.Cells[$"H{row}"].Value = $"{userRc.Department} | {userRc.CardID}\n";
                                    worksheet.Cells[$"H{row}"].Value += $"{userRc.CnName} | {userRc.VnName}";
                                }
                            }

                        }
                        worksheet.Cells[$"I{row}"].Value = $"{work.DueDate?.ToString("yyyy-MM-dd HH:mm")}";
                        worksheet.Cells[$"J{row}"].Value = $"{work.Status ?? ""}";
                        worksheet.Cells[$"J{row}"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                        switch (work.Status)
                        {
                            case "On-going":
                                {
                                    worksheet.Cells[$"J{row}"].Style.Font.Color.SetColor(ColorTranslator.FromHtml("#9c5700"));
                                    worksheet.Cells[$"J{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                    worksheet.Cells[$"J{row}"].Style.Fill.BackgroundColor.SetColor(ColorTranslator.FromHtml("#ffeb9c"));
                                    break;
                                }
                            case "Done":
                                {
                                    worksheet.Cells[$"J{row}"].Style.Font.Color.SetColor(ColorTranslator.FromHtml("#006100"));
                                    worksheet.Cells[$"J{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                    worksheet.Cells[$"J{row}"].Style.Fill.BackgroundColor.SetColor(ColorTranslator.FromHtml("#c6efce"));
                                    break;
                                }
                            case "Open":
                                {
                                    worksheet.Cells[$"J{row}"].Style.Font.Color.SetColor(ColorTranslator.FromHtml("#9c0006"));
                                    worksheet.Cells[$"J{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                    worksheet.Cells[$"J{row}"].Style.Fill.BackgroundColor.SetColor(ColorTranslator.FromHtml("#ffc7ce"));
                                    break;
                                }
                            case "Close":
                                {
                                    worksheet.Cells[$"J{row}"].Style.Font.Color.SetColor(ColorTranslator.FromHtml("#f1f1ff"));
                                    worksheet.Cells[$"J{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                    worksheet.Cells[$"J{row}"].Style.Fill.BackgroundColor.SetColor(ColorTranslator.FromHtml("#a5a5a5"));
                                    break;
                                }
                        }
                        if (work.Detail != null || work.Detail != "")
                        {
                            worksheet.Cells[$"K{row}"].Value = work.Detail;
                        }
                        else
                        {
                            worksheet.Cells[$"K{row}"].Value = $"";
                        }
                    }
                    ExcelRange cells = worksheet.Cells[$"A{row}:K{row}"];
                    foreach (var cell in cells)
                    {
                        cell.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                        cell.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        cell.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                        cell.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    }
                }
            }
            package.Save();
            try
            {

            }
            catch
            {
                return Json(new { error = true, message = "Create Excel file error. Please reload page or contact us!" });
            }

            #endregion

            return File(filePath, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"WorkTable_{_date}.xlsx");
        }
        private double PixelWidthToExcel(int pixels)
        {
            var tempWidth = pixels * 0.14099;
            var correction = (tempWidth / 100) * -1.30;

            return tempWidth - correction;
        }
        private double PixelHeightToExcel(int pixels)
        {
            return pixels * 0.75;
        }
    }
}


//using HandOver.Common;
//using Newtonsoft.Json.Linq;
//using Newtonsoft.Json;
//using System;
//using System.Collections.Generic;
//using System.Data.Entity.Migrations;
//using System.Linq;
//using System.Web;
//using System.Web.Mvc;

//namespace HandOver.Areas.Handover.Controllers
//{
//    public class WorksController : BaseController
//    {
//        private readonly TransferWorkEntities db = new TransferWorkEntities();
//        List<Work> ListWorks = new List<Work>();
//        List<User> ListUsers = new List<User>();
//        // GET: Owner PE - RE/Works
//        public ActionResult Index()
//        {
//            ViewBag.Role = MySession.USER_ROLE;
//            return View();
//        }
//        public JsonResult GetListWork()
//        {
//            try
//            {
//                ListWorks = db.Works.OrderBy(s => s.ID).Where(w => w.Flow == "PE" + "-" + "RE" || w.Flow == "RE" + "-" + "PE").ToList();
//                ListUsers = db.Users.Distinct().ToList();

//                var infoUser = ListUsers.Where(u => u.CardID != MySession.USER_SESSION)
//                                        .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName });
//                for (int i = 0; i < ListWorks.Count; i++)
//                {
//                    if (MySession.USER_ROLE != 1)
//                    {
//                        if (MySession.USER_ACTIVE != 1)
//                        {
//                            if (ListWorks[i].OwnerRequest != MySession.USER_SESSION && ListWorks[i].OwnerReceive != MySession.USER_SESSION)
//                            {
//                                ListWorks[i].HistoryLog = "{}";
//                            }
//                        }
//                    }
//                    ListWorks[i].OwnerRequest = JsonConvert.SerializeObject(ListUsers.Where(u => u.CardID == ListWorks[i].OwnerRequest)
//                            .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName }));
//                    ListWorks[i].OwnerReceive = JsonConvert.SerializeObject(ListUsers.Where(u => u.CardID == ListWorks[i].OwnerReceive)
//                            .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName }));
//                }
//                //check result
//                if (ListWorks.Count < 1)
//                {
//                    return Json(new { Status = "fail", err = "Server get list work = null!", infoUser = infoUser }, JsonRequestBehavior.AllowGet);
//                }
//                if (infoUser == null)
//                {
//                    return Json(new { Status = "fail", err = "Server get list user = null" }, JsonRequestBehavior.AllowGet);
//                }
//                return Json(new { status = "success", data = ListWorks, infoUser = infoUser }, JsonRequestBehavior.AllowGet);
//            }
//            catch
//            {
//                return Json(new { Status = "fail", err = "Get list work from server fail!" }, JsonRequestBehavior.AllowGet);
//            }
//        }
//        public JsonResult AddWork(Work work)
//        {
//            #region validation
//            if (work.OwnerRequest == null || work.OwnerReceive == null)
//                return Json(new { status = "Owner null" });
//            if (work.DateStart < new DateTime(2000, 01, 01))
//                return Json(new { status = "Date fail" });
//            if (work.Type == null)
//                return Json(new { status = "Type null" });
//            if (work.Status == null)
//                return Json(new { status = "Status null" });
//            if (work.OwnerReceive == work.OwnerRequest)
//                return Json(new { status = "Double check Owner" });
//            string depReq;
//            string depRec;
//            try
//            {
//                depReq = db.Users.SingleOrDefault(u => u.CardID == work.OwnerRequest).Department;
//                depRec = db.Users.SingleOrDefault(u => u.CardID == work.OwnerReceive).Department;

//                if ((depReq == "PE" && depRec != "RE") || (depReq == "RE" && depRec != "PE"))
//                    return Json(new { status = "Wrong Depart" });
//            }
//            catch
//            {
//                return Json(new { status = "CARD ID FAIL" });
//            }
//            work.Flow = depReq + "-" + depRec;
//            #endregion

//            #region Save to database
//            try
//            {
//                db.Works.Add(work);
//                db.SaveChanges();
//                ListUsers = db.Users.ToList();
//                work.OwnerRequest = JsonConvert.SerializeObject(ListUsers.Where(u => u.CardID == work.OwnerRequest)
//                        .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName }));
//                work.OwnerReceive = JsonConvert.SerializeObject(ListUsers.Where(u => u.CardID == work.OwnerReceive)
//                        .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName }));
//                return Json(new { status = "success", dataRow = work });
//            }
//            catch (Exception ex)
//            {
//                return Json(new { status = "fail", err = ex });
//            }
//            #endregion
//        }
//        public JsonResult DeleteWork(int id)
//        {
//            var record = db.Works.FirstOrDefault(r => r.ID == id);
//            if (record == null)
//                return Json(new { status = "not found" });
//            else
//            {
//                if (MySession.USER_ROLE != 1)
//                {
//                    if (MySession.USER_ACTIVE != 1)
//                    {
//                        if (record.OwnerRequest != MySession.USER_SESSION && record.OwnerReceive != MySession.USER_SESSION)
//                        {
//                            return Json(new { status = "not access" });
//                        }
//                    }
//                }
//                if (MySession.USER_SESSION == record.OwnerRequest || MySession.USER_SESSION == record.OwnerReceive)
//                {
//                    try
//                    {
//                        db.Works.Remove(record);
//                        db.SaveChanges();
//                        return Json(new { status = "success" });
//                    }
//                    catch
//                    {
//                        return Json(new { status = "server error" });
//                    }
//                }
//                return Json(new { status = "not access" });
//            }
//        }
//        public JsonResult GetWork(int id)
//        {
//            var record = db.Works.FirstOrDefault(r => r.ID == id);
//            if (record == null) return Json(new { status = "not found" }); // khong tim thay ban ghi
//            else
//            {
//                ListUsers = db.Users.ToList();
//                var infoUser = ListUsers.Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName });
//                User userReq = ListUsers.SingleOrDefault(u => u.CardID == record.OwnerRequest);
//                userReq.Password = "reset";
//                User userRec = ListUsers.SingleOrDefault(u => u.CardID == record.OwnerReceive);
//                userRec.Password = "reset";
//                return Json(new { status = "success", data = record, listUser = infoUser, userReq = userReq, userRec = userRec }, JsonRequestBehavior.AllowGet);
//            }
//        }
//        public JsonResult EditWork(Work work, string changeTime, string userChange)
//        {
//            var record = db.Works.FirstOrDefault(r => r.ID == work.ID);
//            if (record == null) return Json(new { status = "not found" }); // khong tim thay ban ghi
//            else
//            {
//                if (MySession.USER_ROLE != 1)
//                {
//                    if (MySession.USER_ACTIVE != 1)
//                    {
//                        if (record.OwnerRequest != MySession.USER_SESSION && record.OwnerReceive != MySession.USER_SESSION)
//                        {
//                            return Json(new { status = "not access" });
//                        }
//                    }
//                }
//            }
//            #region validation
//            if (work.OwnerRequest == null || work.OwnerReceive == null)
//                return Json(new { status = "Owner null" });
//            if (work.DateStart < new DateTime(2000, 01, 01))
//                return Json(new { status = "Date fail" });
//            if (work.Type == null)
//                return Json(new { status = "Type null" });
//            if (work.Status == null)
//                return Json(new { status = "Status null" });
//            if (work.OwnerReceive == work.OwnerRequest)
//                return Json(new { status = "Double check Owner" });
//            string depReq;
//            string depRec;
//            try
//            {
//                depReq = db.Users.SingleOrDefault(u => u.CardID == work.OwnerRequest).Department;
//                depRec = db.Users.SingleOrDefault(u => u.CardID == work.OwnerReceive).Department;

//                if(depReq == depRec)
//                    return Json(new { status = "Wrong Depart" });

//            }
//            catch
//            {
//                return Json(new { status = "CARD ID FAIL" });
//            }
//            work.Flow = depReq + "-" + depRec;
//            #endregion

//            #region Create log change
//            Work _old = db.Works.SingleOrDefault(w => w.ID == work.ID);
//            work.HistoryLog = CreateChangeLog(userChange, changeTime, _old, work);
//            #endregion

//            #region Save to database
//            try
//            {
//                db.Works.AddOrUpdate(w => w.ID, work);
//                db.SaveChanges();
//                ListUsers = db.Users.ToList();
//                work.OwnerRequest = JsonConvert.SerializeObject(ListUsers.Where(u => u.CardID == work.OwnerRequest)
//                        .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName }));
//                work.OwnerReceive = JsonConvert.SerializeObject(ListUsers.Where(u => u.CardID == work.OwnerReceive)
//                        .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName }));
//                return Json(new { status = "Edit success", dataRow = work });
//            }
//            catch (Exception ex)
//            {
//                return Json(new { status = ex.Message });
//            }
//            #endregion
//        }
//        private string CreateChangeLog(string UserChange, string changeTime, Work _old, Work _new)
//        {
//            #region init
//            JObject jsonObject = new JObject();
//            JArray jsonArray = new JArray();
//            #endregion

//            #region check change
//            if (_old.Status != _new.Status)
//            {
//                jsonArray.Add(new JObject(
//                    new JProperty("User", UserChange),
//                    new JProperty("Action", "Status"),
//                    new JProperty("Old", _old.Status),
//                    new JProperty("New", _new.Status)
//                ));
//            } //Status
//            if (_old.Type != _new.Type)
//            {
//                jsonArray.Add(new JObject(
//                    new JProperty("User", UserChange),
//                    new JProperty("Action", "Type"),
//                    new JProperty("Old", _old.Type),
//                    new JProperty("New", _new.Type)
//                ));
//            } //Type
//            if (_old.DateStart != _new.DateStart)
//            {
//                jsonArray.Add(new JObject(
//                    new JProperty("User", UserChange),
//                    new JProperty("Action", "Date"),
//                    new JProperty("Old", _old.DateStart),
//                    new JProperty("New", _new.DateStart)
//                ));
//            } //Date
//            if (_old.OwnerRequest != _new.OwnerRequest)
//            {
//                jsonArray.Add(new JObject(
//                    new JProperty("User", UserChange),
//                    new JProperty("Action", "Owner Request"),
//                    new JProperty("Old", _old.OwnerRequest),
//                    new JProperty("New", _new.OwnerRequest)
//                ));
//            } //OwnerRequest
//            if (_old.OwnerReceive != _new.OwnerReceive)
//            {
//                jsonArray.Add(new JObject(
//                    new JProperty("User", UserChange),
//                    new JProperty("Action", "Owner Receive"),
//                    new JProperty("Old", _old.OwnerReceive),
//                    new JProperty("New", _new.OwnerReceive)
//                ));
//            } //OwnerReceive
//            if (_old.WorkDes != _new.WorkDes)
//            {
//                jsonArray.Add(new JObject(
//                    new JProperty("User", UserChange),
//                    new JProperty("Action", "Works"),
//                    new JProperty("Old", _old.WorkDes),
//                    new JProperty("New", _new.WorkDes)
//                ));
//            } //OwnerReceive
//            if (_old.Detail != _new.Detail)
//            {
//                jsonArray.Add(new JObject(
//                    new JProperty("User", UserChange),
//                    new JProperty("Action", "Result"),
//                    new JProperty("Old", _old.Detail),
//                    new JProperty("New", _new.Detail)
//                ));
//            } //OwnerReceive
//            #endregion

//            if (_old.HistoryLog != null) // Has log
//            {
//                jsonObject = JObject.Parse(_old.HistoryLog);
//                if (jsonObject.ContainsKey(changeTime)) //has key => update key
//                {
//                    JArray arrFirst = (JArray)jsonObject[changeTime];
//                    arrFirst.Merge(jsonArray);
//                }
//                else
//                {
//                    jsonObject.Add(changeTime, jsonArray);
//                }
//            }
//            else // Hasn't log + hasn't key
//            {
//                jsonObject.Add(changeTime, jsonArray);
//            }
//            return JsonConvert.SerializeObject(jsonObject);
//        }
//    }
//}