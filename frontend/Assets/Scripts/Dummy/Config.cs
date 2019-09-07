using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using TinyRoar.Framework;
using UnityEngine.SceneManagement;

public class Config : MonoSingleton<Config>
{
    public Vector2 BaseScreenSize;
    public string Url = "https://evan.dtrautwein.eu/api";
    public List<Sprite> CardImages;


}