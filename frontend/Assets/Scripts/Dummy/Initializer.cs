using UnityEngine;
using System.Collections;
using TinyRoar.Framework;

public class Initializer : MonoSingleton<Initializer>
{
    void Start () {
        MatchManager.Instance.Init();
    }
}
