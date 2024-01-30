using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Plugin.Tezos.src.Utils
{
    public class JsonObjectStore
    {
        private readonly string _filePath;
        private Dictionary<string, string>? _store;

        public JsonObjectStore(string filePath)
        {
            _filePath = filePath;
            _store = !File.Exists(_filePath) ? new Dictionary<string, string>() : LoadFromFile();
        }

        public void Store<T>(string id, T obj)
        {
            string json = JsonSerializer.Serialize(obj);
            if (_store != null)
            {
                _store[id] = json;
            }
            SaveToFile();
        }

        public void UnStore(string id)
        {
            if (_store != null && _store.ContainsKey(id))
            {
                _store.Remove(id);
            }
            SaveToFile();
        }

        public T? Retrieve<T>(string id)
        {
            if (_store == null ||
             !_store.ContainsKey(id))
            {
                return default(T);
            }

            string json = _store[id];
            return JsonSerializer.Deserialize<T>(json);
        }

        private Dictionary<string, string>? LoadFromFile()
        {
            string json = File.ReadAllText(_filePath);
            return JsonSerializer.Deserialize<Dictionary<string, string>>(json);
        }

        private void SaveToFile()
        {
            string json = JsonSerializer.Serialize(_store);
            File.WriteAllText(_filePath, json);
        }

        public void Clean()
        {
            File.Delete(_filePath);
        }
    }
}
