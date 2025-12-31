namespace ProfitMate_V2.Models
{
    public class FormElement
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Type { get; set; } = "Text"; // Text, TextArea, Select, Radio
        public string Label { get; set; } = "";
        public string Options { get; set; } = "";
        public bool IsRequired { get; set; } = false;
    }
}